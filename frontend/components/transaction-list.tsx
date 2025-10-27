"use client"

import { ExternalLink, FileText } from "lucide-react"

const transactions = [
  {
    hash: "0xb248...402a",
    timing: "Poor timing - 93%",
    paid: "1.64 Gwei",
    optimal: "0.12 Gwei",
    savings: "-$0.12",
  },
  {
    hash: "0x7a3f...8b2c",
    timing: "Poor timing - 89%",
    paid: "1.52 Gwei",
    optimal: "0.17 Gwei",
    savings: "-$0.18",
  },
  {
    hash: "0x9c1d...4e5f",
    timing: "Poor timing - 95%",
    paid: "1.78 Gwei",
    optimal: "0.09 Gwei",
    savings: "-$0.18",
  },
]

export function TransactionList() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
        </div>
        <p className="text-sm text-muted-foreground">Last 90 days</p>
      </div>

      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <div
            key={index}
            className="group p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border transition-all hover:shadow-lg space-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                  <span>{tx.hash}</span>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="px-2 py-1 rounded-md bg-destructive/20 text-destructive text-xs font-medium whitespace-nowrap">
                {tx.timing}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Paid: <span className="font-medium text-foreground">{tx.paid}</span> (Optimal: {tx.optimal})
              </span>
              <span className="font-bold text-destructive">{tx.savings}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors">
        View all transactions →
      </button>
    </div>
  )
}
