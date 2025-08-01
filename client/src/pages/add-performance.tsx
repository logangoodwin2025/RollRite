import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { BowlingBall, OilPattern, InsertPerformanceData } from "../../shared/schema";

// Mock user ID for demo purposes
const DEMO_USER_ID = "test-user-1";

const performanceFormSchema = z.object({
  venue: z.string().min(2, "Venue is required."),
  score: z.coerce.number().min(0).max(300, "Score must be between 0 and 300."),
  carryPercentage: z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100."),
  entryAngle: z.coerce.number().min(0).max(10, "Angle must be between 0 and 10."),
  gameDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid date is required.",
  }),
  ballId: z.string().min(1, "Please select a ball."),
  patternId: z.string().min(1, "Please select a pattern."),
});

type PerformanceFormValues = z.infer<typeof performanceFormSchema>;

export default function AddPerformance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: balls, isLoading: ballsLoading } = useQuery<BowlingBall[]>({
    queryKey: ["/api/balls", DEMO_USER_ID],
    queryFn: () => fetch(`/api/balls/${DEMO_USER_ID}`).then((res) => res.json()),
  });

  const { data: patterns, isLoading: patternsLoading } = useQuery<OilPattern[]>({
    queryKey: ["/api/patterns"],
    queryFn: () => fetch("/api/patterns").then((res) => res.json()),
  });

  const mutation = useMutation({
    mutationFn: (newPerformance: InsertPerformanceData) => {
      return fetch("/api/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPerformance),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance", DEMO_USER_ID] });
      toast({
        title: "Success!",
        description: "Your game has been logged.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log your game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceFormSchema),
    defaultValues: {
      venue: "",
      score: 0,
      carryPercentage: 0,
      entryAngle: 0,
      gameDate: new Date().toISOString().split("T")[0],
    },
  });

  function onSubmit(data: PerformanceFormValues) {
    const performanceData: InsertPerformanceData = {
      ...data,
      userId: DEMO_USER_ID,
      carryPercentage: String(data.carryPercentage),
      entryAngle: String(data.entryAngle),
      gameDate: new Date(data.gameDate),
    };
    mutation.mutate(performanceData);
  }

  if (ballsLoading || patternsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">Add Performance Data</h1>
        <p className="text-sm md:text-base text-gray-600">Log a new game to track your stats.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Game Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Strike Zone Lanes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gameDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carryPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carry Percentage</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="entryAngle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Angle</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ballId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bowling Ball</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a ball" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {balls?.map((ball) => (
                            <SelectItem key={ball.id} value={ball.id}>
                              {ball.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patternId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Pattern</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patterns?.map((pattern) => (
                            <SelectItem key={pattern.id} value={pattern.id}>
                              {pattern.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Logging..." : "Log Game"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
