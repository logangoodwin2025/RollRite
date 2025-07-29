import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Map } from "lucide-react";
import { PatternCard } from "@/components/pattern-card";
import type { OilPattern } from "@shared/schema";

export default function OilPatterns() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const { data: patterns, isLoading } = useQuery({
    queryKey: ["/api/patterns"],
  });

  const filterButtons = [
    { key: "all", label: "All Patterns" },
    { key: "pba", label: "PBA Patterns" },
    { key: "wtba", label: "WTBA Patterns" },
    { key: "kegel", label: "Kegel Patterns" },
    { key: "custom", label: "Custom Patterns" },
  ];

  const filteredPatterns = patterns?.filter((pattern: OilPattern) => {
    if (activeFilter === "all") return true;
    return pattern.category === activeFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">Oil Pattern Library</h1>
          <p className="text-sm md:text-base text-gray-600">Browse professional oil patterns and create custom patterns</p>
        </div>
        <Button className="bg-bowling-blue hover:bg-blue-800 text-white w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Pattern
        </Button>
      </div>

      {/* Pattern Categories */}
      <div className="flex flex-wrap gap-4">
        {filterButtons.map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            onClick={() => setActiveFilter(filter.key)}
            className={
              activeFilter === filter.key
                ? "bg-bowling-blue text-white"
                : "bg-gray-200 text-charcoal hover:bg-gray-300"
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Pattern Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredPatterns?.map((pattern: OilPattern) => (
          <PatternCard key={pattern.id} pattern={pattern} />
        ))}

        {/* Add Pattern Card - only show for custom filter */}
        {activeFilter === "custom" && (
          <Card className="border-2 border-dashed border-gray-300 hover:border-bowling-blue transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Plus className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Add Custom Pattern</h3>
              <p className="text-sm text-gray-500">Create your own oil pattern configuration</p>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredPatterns?.length === 0 && (
        <Card className="p-12 text-center">
          <CardContent>
            <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Patterns Found</h3>
            <p className="text-gray-400">No patterns match the selected filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
