"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Summary, getSummary } from "@/lib/api";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

export function DashboardCards() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await getSummary();
        setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load summary data
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Balance",
      value: `$${summary.balance.toFixed(2)}`,
      icon: Wallet,
      color: summary.balance >= 0 ? "text-green-600" : "text-red-600",
      description: "Current balance"
    },
    {
      title: "Total Income",
      value: `$${summary.income.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-600",
      description: "Total earned"
    },
    {
      title: "Total Expenses",
      value: `$${summary.expenses.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-600",
      description: "Total spent"
    },
    {
      title: "Transactions",
      value: summary.transaction_count.toString(),
      icon: DollarSign,
      color: "text-blue-600",
      description: "Total count"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}