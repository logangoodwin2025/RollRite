import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertBowlingBallSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBowlingBall } from "@shared/schema";

interface AddBallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const formSchema = insertBowlingBallSchema.extend({
  name: insertBowlingBallSchema.shape.name.min(1, "Ball name is required"),
  brand: insertBowlingBallSchema.shape.brand.min(1, "Brand is required"),
});

export function AddBallModal({ isOpen, onClose, userId }: AddBallModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBowlingBall>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      name: "",
      brand: "",
      weight: 15,
      coreType: "symmetrical",
      coverstockType: "reactive",
      surface: "",
      drilling: "",
      gamesPlayed: 0,
      averageScore: null,
      hookPotential: "medium",
    },
  });

  const addBall = useMutation({
    mutationFn: async (data: InsertBowlingBall) => {
      const response = await apiRequest("POST", "/api/balls", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/balls", userId] });
      toast({
        title: "Success",
        description: "Ball added to your arsenal!",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add ball. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBowlingBall) => {
    addBall.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Ball</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ball Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Storm Phaze II" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Storm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="13">13</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coreType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="symmetrical">Symmetrical</SelectItem>
                        <SelectItem value="asymmetrical">Asymmetrical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="coverstockType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverstock Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="reactive">Reactive Resin</SelectItem>
                      <SelectItem value="urethane">Urethane</SelectItem>
                      <SelectItem value="plastic">Plastic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="surface"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surface Finish</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2000 Abralon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="drilling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drilling Layout</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pin Up 4.5&quot;" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hookPotential"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hook Potential</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addBall.isPending}
                className="flex-1 bg-bowling-blue hover:bg-blue-800 text-white"
              >
                {addBall.isPending ? "Adding..." : "Add Ball"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
