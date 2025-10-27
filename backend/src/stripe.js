const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// In-memory storage for active subscriptions
const userSubscriptions = new Map();

// Track trial history to prevent multiple free trials
const trialHistory = new Map();

// Create Stripe Checkout session
async function createCheckoutSession(walletAddress, successUrl, cancelUrl) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured. Add STRIPE_SECRET_KEY to .env');
  }

  // Check if user has already had a trial
  const hasHadTrial = trialHistory.has(walletAddress.toLowerCase());
  console.log(`🔍 [STRIPE] Creating checkout for ${walletAddress}, hasHadTrial: ${hasHadTrial}`);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'if_required', // CRITICAL: Only require payment after trial
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'GasGuard Pro', // Changed from GasGuardAI
              description: 'Smart Ethereum gas fee optimization', // Changed from AI-powered
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 799, // $7.99
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}`,
      client_reference_id: walletAddress,
      metadata: {
        walletAddress: walletAddress,
      },
      subscription_data: {
        metadata: {
          walletAddress: walletAddress,
        },
        // Only give trial if they haven't had one before
        trial_period_days: hasHadTrial ? 0 : 14,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Handle webhook from Stripe
async function handleWebhook(rawBody, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw err;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const walletAddress = session.metadata.walletAddress || session.client_reference_id;

      console.log(`✅ [STRIPE WEBHOOK] Checkout completed for ${walletAddress}`);
      console.log(`💳 [STRIPE WEBHOOK] Customer ID: ${session.customer}`);
      console.log(`📝 [STRIPE WEBHOOK] Subscription ID: ${session.subscription}`);

      // Update customer metadata with wallet address
      if (session.customer) {
        try {
          await stripe.customers.update(session.customer, {
            metadata: {
              walletAddress: walletAddress.toLowerCase()
            }
          });
          console.log(`✅ [STRIPE WEBHOOK] Customer metadata updated with wallet address`);
        } catch (updateError) {
          console.error(`❌ [STRIPE WEBHOOK] Failed to update customer metadata:`, updateError);
        }
      }

      // Mark that this wallet has had a trial
      const walletLower = walletAddress.toLowerCase();
      if (!trialHistory.has(walletLower)) {
        trialHistory.set(walletLower, {
          firstTrialStarted: Date.now(),
          subscriptionId: session.subscription,
        });
        console.log(`✅ [STRIPE WEBHOOK] Trial history recorded for ${walletAddress}`);
      }

      // Activate subscription in memory
      userSubscriptions.set(walletLower, {
        subscriptionId: session.subscription,
        customerId: session.customer,
        status: 'trialing', // Initial status is trialing
        startedAt: Date.now(),
        trialEnd: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days from now
        currentPeriodEnd: Date.now() + (14 * 24 * 60 * 60 * 1000),
      });

      console.log(`✅ [STRIPE WEBHOOK] Subscription activated in memory for ${walletAddress}`);
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      const metadata = subscription.metadata;

      if (metadata && metadata.walletAddress) {
        const wallet = metadata.walletAddress.toLowerCase();

        // Record trial history if this wallet is trialing/active
        if (subscription.status === 'trialing' || subscription.status === 'active') {
          if (!trialHistory.has(wallet)) {
            trialHistory.set(wallet, {
              firstTrialStarted: Date.now(),
              subscriptionId: subscription.id,
            });
            console.log(`✅ [STRIPE WEBHOOK] Trial history recorded for ${wallet}`);
          }
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          userSubscriptions.set(wallet, {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            startedAt: Date.now(),
            trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
          });
        } else {
          // Subscription cancelled or expired - keep trial history but remove active subscription
          userSubscriptions.delete(wallet);
          console.log(`⚠️  [STRIPE WEBHOOK] Subscription ${subscription.status} for ${wallet}, trial history preserved`);
        }

        console.log(`Subscription updated for ${wallet}: ${subscription.status}`);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

// Check if user has active subscription
function hasActiveSubscription(walletAddress) {
  const subscription = userSubscriptions.get(walletAddress.toLowerCase());

  if (!subscription) return false;

  // Check if trial is still active
  if (subscription.trialEnd && Date.now() < subscription.trialEnd) {
    return true;
  }

  // Check if subscription is active
  return subscription.status === 'active' || subscription.status === 'trialing';
}

// Get subscription status (check both in-memory and Stripe API)
async function getSubscriptionStatus(walletAddress) {
  console.log(`💳 [STRIPE] Checking subscription for: ${walletAddress}`);

  // First check in-memory cache
  const cached = userSubscriptions.get(walletAddress.toLowerCase());

  if (cached) {
    console.log('✅ [STRIPE] Found in-memory cache:', cached);
    const isTrialing = cached.trialEnd && Date.now() < cached.trialEnd;
    const trialDaysLeft = isTrialing
      ? Math.ceil((cached.trialEnd - Date.now()) / (24 * 60 * 60 * 1000))
      : 0;

    const hasHadTrial = trialHistory.has(walletAddress.toLowerCase());
    
    return {
      isSubscribed: true,
      status: cached.status,
      isTrialing,
      trialDaysLeft,
      hasHadTrial,
      trialEnd: cached.trialEnd ? new Date(cached.trialEnd) : null,
      currentPeriodEnd: cached.currentPeriodEnd ? new Date(cached.currentPeriodEnd) : null,
      cancelAtPeriodEnd: false,
      customerId: cached.customerId,
      startedAt: cached.startedAt ? new Date(cached.startedAt) : null, // Return subscription start date
    };
  }

  console.log('⚠️  [STRIPE] Not in cache, checking Stripe API...');

  // If not in memory, check Stripe API
  try {
    // Search for customer by metadata
    console.log(`🔍 [STRIPE] Searching Stripe API for wallet: ${walletAddress.toLowerCase()}`);
    const customers = await stripe.customers.search({
      query: `metadata['walletAddress']:'${walletAddress.toLowerCase()}'`,
    });

    console.log(`📊 [STRIPE] Found ${customers.data.length} customers`);

    if (customers.data.length === 0) {
      console.log('❌ [STRIPE] No customer found in Stripe');
      // Check if they've had a trial before
      const hasHadTrial = trialHistory.has(walletAddress.toLowerCase());
      return {
        isSubscribed: false,
        status: 'none',
        hasHadTrial,
        trialEnd: null,
        currentPeriodEnd: null
      };
    }

    const customer = customers.data[0];
    console.log(`👤 [STRIPE] Customer found: ${customer.id}`);

    // Get subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1
    });

    console.log(`📋 [STRIPE] Found ${subscriptions.data.length} subscriptions`);

    if (subscriptions.data.length === 0) {
      console.log('❌ [STRIPE] No subscriptions found');
      // Check if they've had a trial before
      const hasHadTrial = trialHistory.has(walletAddress.toLowerCase());
      return {
        isSubscribed: false,
        status: 'none',
        hasHadTrial,
        trialEnd: null,
        currentPeriodEnd: null
      };
    }

    const subscription = subscriptions.data[0];
    console.log(`✅ [STRIPE] Subscription found: ${subscription.id}, status: ${subscription.status}`);

    // Cache it in memory
    userSubscriptions.set(walletAddress.toLowerCase(), {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      startedAt: Date.now(),
      trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
      currentPeriodEnd: subscription.current_period_end * 1000,
    });

    // Calculate subscription start date from Stripe data
    let startedAt;
    if (subscription.trial_start) {
      startedAt = new Date(subscription.trial_start * 1000);
    } else if (subscription.start_date) {
      startedAt = new Date(subscription.start_date * 1000);
    } else {
      // Fallback: estimate from current period
      startedAt = new Date(subscription.current_period_start * 1000);
    }

    const hasHadTrial = trialHistory.has(walletAddress.toLowerCase());
    
    return {
      isSubscribed: true,
      status: subscription.status,
      isTrialing: subscription.status === 'trialing',
      hasHadTrial,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      startedAt: startedAt
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isSubscribed: false,
      status: 'error',
      trialEnd: null,
      currentPeriodEnd: null
    };
  }
}

// Create customer portal session (for managing subscription)
async function createPortalSession(walletAddress, returnUrl) {
  const subscription = userSubscriptions.get(walletAddress.toLowerCase());

  if (!subscription || !subscription.customerId) {
    throw new Error('No active subscription found');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: returnUrl || process.env.FRONTEND_URL,
    });

    return {
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

// Verify and activate subscription from session
async function verifyAndActivateSession(sessionId) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured');
  }

  try {
    console.log(`🔍 [STRIPE] Verifying session: ${sessionId}`);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    console.log(`✅ [STRIPE] Session found, status: ${session.status}`);

    // Get wallet address from metadata
    const walletAddress = session.metadata?.walletAddress || session.client_reference_id;

    if (!walletAddress) {
      throw new Error('No wallet address found in session');
    }

    console.log(`👛 [STRIPE] Wallet address: ${walletAddress}`);

    // Check if already activated
    const existing = userSubscriptions.get(walletAddress.toLowerCase());
    if (existing && existing.subscriptionId === session.subscription) {
      console.log(`⚠️  [STRIPE] Already activated`);
      return {
        alreadyActivated: true,
        walletAddress,
      };
    }

    // Update customer metadata with wallet address
    if (session.customer) {
      try {
        await stripe.customers.update(session.customer, {
          metadata: {
            walletAddress: walletAddress.toLowerCase()
          }
        });
        console.log(`✅ [STRIPE] Customer metadata updated with wallet address`);
      } catch (updateError) {
        console.error(`❌ [STRIPE] Failed to update customer metadata:`, updateError);
      }
    }

    const walletLower = walletAddress.toLowerCase();
    
    // Mark that this wallet has had a trial
    if (!trialHistory.has(walletLower)) {
      trialHistory.set(walletLower, {
        firstTrialStarted: Date.now(),
        subscriptionId: session.subscription,
      });
      console.log(`✅ [STRIPE] Trial history recorded for ${walletAddress}`);
    }
    
    // Activate subscription
    userSubscriptions.set(walletLower, {
      subscriptionId: session.subscription,
      customerId: session.customer,
      status: 'trialing',
      startedAt: Date.now(),
      trialEnd: Date.now() + (14 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: Date.now() + (14 * 24 * 60 * 60 * 1000),
    });

    console.log(`✅ [STRIPE] Subscription manually activated for ${walletAddress} (session: ${sessionId})`);

    return {
      activated: true,
      walletAddress,
      subscriptionId: session.subscription,
      message: 'Subscription activated! Refresh the page to see Pro badge.'
    };
  } catch (error) {
    console.error('❌ [STRIPE] Error verifying session:', error);
    throw error;
  }
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  hasActiveSubscription,
  getSubscriptionStatus,
  createPortalSession,
  verifyAndActivateSession,
};
