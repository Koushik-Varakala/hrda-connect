import { Layout } from "@/components/Layout";
import { useAchievements } from "@/hooks/use-achievements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Achievements() {
  const { data: achievements, isLoading } = useAchievements();

  return (
    <Layout>
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-center mb-4">Our Achievements</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Milestones in our journey towards a better healthcare ecosystem.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements?.filter(a => a.active).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full card-hover overflow-hidden flex flex-col">
                  {achievement.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={achievement.imageUrl} 
                        alt={achievement.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    {achievement.date && (
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        {format(new Date(achievement.date), 'MMMM yyyy')}
                      </div>
                    )}
                    <CardTitle className="text-xl">{achievement.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
