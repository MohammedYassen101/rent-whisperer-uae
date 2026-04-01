import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Building2, Wrench } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContactInfo() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          {t("contact.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t("contact.leasingExec")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">
                Mohamed Abdelhamid Yassen
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("contact.leasingExecRole")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <ContactItem
              icon={<Mail className="w-4 h-4" />}
              label={t("contact.email")}
              value="mohamed.yassen@alyassiaproperties.ae"
              href="mailto:mohamed.yassen@alyassiaproperties.ae"
            />
            <ContactItem
              icon={<Phone className="w-4 h-4" />}
              label={t("contact.customerService")}
              value="+971 2 667 3444"
              href="tel:+97126673444"
            />
            <ContactItem
              icon={<Phone className="w-4 h-4" />}
              label={t("contact.mobile")}
              value="+971 54 220 2683"
              href="tel:+971542202683"
            />
            <ContactItem
              icon={<Wrench className="w-4 h-4" />}
              label={t("contact.maintEmail")}
              value="info@alyassiaproperties.ae"
              href="mailto:info@alyassiaproperties.ae"
            />
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">{t("contact.office")}</p>
              <p className="text-sm text-muted-foreground">
                Omniah Tower, Mezzanine floor, 28 Al Bahhar St,
                <br />
                Al Hisn, Al Markaziyah West, Abu Dhabi, UAE
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button asChild variant="outline" className="w-full">
              <a href="tel:+97126673444">
                <Phone className="w-4 h-4 me-2" />
                {t("contact.callUs")}
              </a>
            </Button>
            <Button asChild className="w-full">
              <a href="mailto:mohamed.yassen@alyassiaproperties.ae">
                <Mail className="w-4 h-4 me-2" />
                {t("contact.emailUs")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardContent className="py-4 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary shrink-0" />
          <div>
            <p className="font-display font-semibold text-foreground">
              Alyassia Properties L.L.C. O.P.C.
            </p>
            <p className="text-sm text-muted-foreground">
              شركة الياسية للعقارات ش.ش ذ.م.م
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary transition-colors group"
    >
      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </a>
  );
}
