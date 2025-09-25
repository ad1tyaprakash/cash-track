"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Transaction, listPosts } from "@/lib/api";

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await listPosts();
        setTransactions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No transactions found. Add your first transaction to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="transition-colors hover:bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{transaction.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
                {transaction.content && (
                  <p className="text-sm text-muted-foreground">{transaction.content}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : ""}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <Badge
                  variant={transaction.type === "income" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {transaction.type}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}