"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createPost } from "@/lib/api";

export function TransactionForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const numericAmount = Number.parseFloat(amount);
      if (Number.isNaN(numericAmount)) {
        setStatus("Enter a valid amount");
        setIsSubmitting(false);
        return;
      }

      await createPost({
        title,
        content,
        amount:
          type === "expense" ? -Math.abs(numericAmount) : Math.abs(numericAmount),
        type,
        category: category || "Other",
      });
      setStatus("Transaction created successfully");
      setTitle("");
      setContent("");
      setAmount("");
      setCategory("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Grocery shopping"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Bills">Bills</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Description</Label>
        <Input
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Transaction"}
      </Button>

      {status && (
        <div className="flex justify-center">
          <Badge variant={status.includes("success") ? "default" : "destructive"}>
            {status}
          </Badge>
        </div>
      )}
    </form>
  );
}