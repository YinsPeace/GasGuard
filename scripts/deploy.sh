#!/bin/bash

echo "Deploying GasGuardAI..."

# Deploy frontend to Vercel
cd frontend
vercel --prod

# Deploy backend (choose one)
# Option 1: Heroku
# cd ../backend
# heroku create gasguard-api
# git push heroku main

# Option 2: AWS Lambda (requires serverless framework)
# cd ../backend
# serverless deploy

echo "Deployment complete!"
