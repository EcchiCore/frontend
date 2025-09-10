
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Shield,
  Info,
  Book,
  FileText,
  Zap,
  Share2,
  Cookie,
  Clock,
  CheckCircle,
  Mail,
  ChevronDown,
  Lock,
  Database,
  Users,
  Settings,
  Globe,
  Eye,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

// Define the CookieItem interface
export default async function PrivacyPolicy() {
  const t = await getTranslations('PrivacyPolicy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-900/50 rounded-full backdrop-blur-sm">
                <Shield className="w-12 h-12 text-gray-200" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-100 mb-6">{t('title')}</h1>
            <p className="text-xl text-gray-300 mb-8">
              {t('description')}
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-gray-200">
              {t('lastUpdated', { date: 'June 15, 2025' })}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Introduction Card */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Info className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-100">{t('about.title')}</CardTitle>
                <CardDescription className="text-base mt-2 text-gray-400">
                  {t('about.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Definitions Section */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Book className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-gray-100">{t('definitions.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { term: t('definitions.service.title'), definition: t('definitions.service.description') },
              { term: t('definitions.personalData.title'), definition: t('definitions.personalData.description') },
              { term: t('definitions.usageData.title'), definition: t('definitions.usageData.description') },
              { term: t('definitions.cookies.title'), definition: t('definitions.cookies.description') },
              { term: t('definitions.user.title'), definition: t('definitions.user.description') }
            ].map((item, index) => (
              <Alert key={index} className="bg-gray-700 border-gray-600">
                <AlertTitle className="font-bold text-gray-100">{item.term}</AlertTitle>
                <AlertDescription className="text-sm text-gray-400">{item.definition}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>

        {/* Information Collection Section */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl text-gray-100">{t('collection.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-300" />
                  <span className="text-lg font-medium text-gray-100">{t('collection.personal.title')}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-300" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 border border-gray-600 rounded-lg">
                <p className="mb-4 text-gray-400">{t('collection.personal.description')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    t('collection.personal.items.email'),
                    t('collection.personal.items.name'),
                    t('collection.personal.items.profile'),
                    t('collection.personal.items.preferences'),
                    t('collection.personal.items.other')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-blue-500"></Badge>
                      <span className="text-sm text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-300" />
                  <span className="text-lg font-medium text-gray-100">{t('collection.automatic.title')}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-300" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 border border-gray-600 rounded-lg">
                <p className="mb-4 text-gray-400">{t('collection.automatic.description')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    t('collection.automatic.items.device'),
                    t('collection.automatic.items.usage'),
                    t('collection.automatic.items.log'),
                    t('collection.automatic.items.location'),
                    t('collection.automatic.items.cookies')
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 bg-purple-500"></Badge>
                      <span className="text-sm text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-gray-300" />
                  <span className="text-lg font-medium text-gray-100">{t('collection.social.title')}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-300" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 border border-gray-600 rounded-lg">
                <p className="text-gray-400">{t('collection.social.description')}</p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-2xl text-gray-100">{t('usage.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-400">{t('usage.description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                t('usage.items.provide'),
                t('usage.items.manage'),
                t('usage.items.process'),
                t('usage.items.communicate'),
                t('usage.items.analyze'),
                t('usage.items.security'),
                t('usage.items.comply'),
                t('usage.items.business')
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                  <Badge variant="default" className="mt-0.5 bg-gray-600 text-gray-200">{index + 1}</Badge>
                  <span className="text-sm text-gray-400">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Share2 className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-gray-100">{t('sharing.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-400">{t('sharing.description')}</p>
            <div className="space-y-4">
              {[
                { title: t('sharing.items.providers.title'), desc: t('sharing.items.providers.description'), icon: Settings },
                { title: t('sharing.items.legal.title'), desc: t('sharing.items.legal.description'), icon: AlertTriangle },
                { title: t('sharing.items.transfers.title'), desc: t('sharing.items.transfers.description'), icon: Globe },
                { title: t('sharing.items.consent.title'), desc: t('sharing.items.consent.description'), icon: UserCheck },
                { title: t('sharing.items.public.title'), desc: t('sharing.items.public.description'), icon: Eye },
                { title: t('sharing.items.safety.title'), desc: t('sharing.items.safety.description'), icon: Shield }
              ].map((item, index) => (
                <Alert key={index} className="border-gray-600 bg-gray-700">
                  <item.icon className="h-4 w-4 text-gray-300" />
                  <AlertTitle className="text-gray-100">{item.title}</AlertTitle>
                  <AlertDescription className="text-gray-400">{item.desc}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cookies Section */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <Cookie className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-2xl text-gray-100">{t('cookies.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-400">{t('cookies.description')}</p>
            <div className="space-y-4">
              {[
                { type: t('cookies.items.essential.title'), desc: t('cookies.items.essential.description'), variant: "destructive" },
                { type: t('cookies.items.functional.title'), desc: t('cookies.items.functional.description'), variant: "default" },
                { type: t('cookies.items.analytics.title'), desc: t('cookies.items.analytics.description'), variant: "secondary" }
              ].map((cookie, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg">
                  <Badge variant={cookie.variant as "default" | "secondary" | "destructive" | "outline"} className="mt-1 bg-gray-600 text-gray-200">{index + 1}</Badge>
                  <div>
                    <h4 className="font-bold mb-1 text-gray-100">{cookie.type}</h4>
                    <p className="text-sm text-gray-400">{cookie.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Alert className="mt-6 bg-gray-700 border-gray-600">
              <Info className="h-4 w-4 text-gray-300" />
              <AlertTitle className="text-gray-100">{t('cookies.note.title')}</AlertTitle>
              <AlertDescription className="text-gray-400">
                {t('cookies.note.description')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Additional Sections */}
        {[
          {
            title: t('security.title'),
            icon: Lock,
            color: "green",
            content: t('security.description')
          },
          {
            title: t('retention.title'),
            icon: Clock,
            color: "blue",
            content: t('retention.description')
          }
        ].map((section, index) => (
          <Card key={index} className="mb-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-2 bg-gray-700 rounded-lg`}>
                  <section.icon className={`w-6 h-6 text-${section.color}-400`} />
                </div>
                <CardTitle className="text-2xl text-gray-100">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">{section.content}</p>
            </CardContent>
          </Card>
        ))}

        {/* Contact Information */}
        <Card className="mb-8 bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-900/50 rounded-lg">
                <Mail className="w-6 h-6 text-gray-200" />
              </div>
              <CardTitle className="text-2xl">{t('contact.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-300">{t('contact.description')}</p>
            <Card className="bg-gray-900/50 backdrop-blur border-gray-600">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-lg p-2 bg-gray-700 text-gray-200">🌐</Badge>
                  <span className="text-lg font-semibold text-gray-100">{t('contact.website')}</span>
                </div>
                <a href="https://chanomhub.online/contact" className="text-lg text-blue-400 hover:underline">
                  https://chanomhub.online/contact
                </a>
                <p className="mt-4 text-sm text-gray-400">
                  {t('contact.response')}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-700 rounded-lg">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <CardTitle className="mb-2 text-gray-100">{t('compliance.title')}</CardTitle>
                <CardDescription className="text-gray-400">
                  {t('compliance.description')}
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
