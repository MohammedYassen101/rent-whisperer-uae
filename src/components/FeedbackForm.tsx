import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";
import { saveFeedback } from "@/utils/storage";
import { toast } from "sonner";
import { feedbackSchema } from "@/utils/validation";
import { useLanguage } from "@/hooks/useLanguage";

export default function FeedbackForm() {
  const { t } = useLanguage();
  const [tenantName, setTenantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = feedbackSchema.safeParse({
      tenantName,
      companyName,
      rating,
      comment,
    });

    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "Please fix the form errors");
      return;
    }

    try {
      await saveFeedback(result.data as Required<typeof result.data>);
      toast.success(t("feedback.success"));
      setTenantName("");
      setCompanyName("");
      setRating(0);
      setComment("");
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">{t("feedback.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("feedback.name")} *</Label>
              <Input
                placeholder={t("feedback.namePlaceholder")}
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("feedback.company")}</Label>
              <Input
                placeholder={t("feedback.companyPlaceholder")}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("feedback.rating")} *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-accent text-accent"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("feedback.comment")}</Label>
            <Textarea
              placeholder={t("feedback.placeholder")}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
          </div>

          <Button type="submit" size="sm" className="w-full">
            <Send className="w-3.5 h-3.5 me-1.5" />
            {t("feedback.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
