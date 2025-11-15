import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);

  const platforms = [
    { name: 'Spotify', icon: 'Music2' },
    { name: 'Apple Music', icon: 'Music' },
    { name: 'VK Музыка', icon: 'Radio' },
    { name: 'Яндекс Музыка', icon: 'Disc3' },
    { name: 'YouTube Music', icon: 'Youtube' },
    { name: 'Deezer', icon: 'Music4' }
  ];

  const pricingPlans = [
    {
      name: 'Старт',
      price: '990',
      period: 'релиз',
      features: ['1 релиз в год', 'До 10 треков', 'Базовая аналитика', 'Техподдержка'],
      popular: false
    },
    {
      name: 'Профи',
      price: '2990',
      period: 'год',
      features: ['Безлимит релизов', 'Безлимит треков', 'Полная аналитика', 'Приоритетная поддержка', 'Смартлинки'],
      popular: true
    },
    {
      name: 'Лейбл',
      price: '9990',
      period: 'год',
      features: ['Всё из Профи', 'До 10 артистов', 'Менеджер проектов', 'API доступ', 'Белый лейбл'],
      popular: false
    }
  ];

  const faqs = [
    {
      q: 'Сколько времени занимает публикация?',
      a: 'Обычно 3-5 рабочих дней после модерации. На некоторых платформах может занять до 2 недель.'
    },
    {
      q: 'Какие форматы файлов принимаются?',
      a: 'Аудио: WAV (24-bit, 44.1kHz или выше) или MP3 (320kbps). Обложка: JPG/PNG 3000×3000px.'
    },
    {
      q: 'Как происходит выплата роялти?',
      a: 'Выплаты ежемесячно от 4000₽. Поддерживаем карты РФ, PayPal, банковские переводы.'
    },
    {
      q: 'Могу ли я удалить релиз после публикации?',
      a: 'Да, в любой момент через личный кабинет. Снятие занимает 1-3 дня.'
    }
  ];

  const mockReleases = [
    { title: 'Midnight Dreams', status: 'Опубликован', streams: 12450, revenue: 1890 },
    { title: 'Summer Vibes EP', status: 'На проверке', streams: 0, revenue: 0 },
    { title: 'Lost in Tokyo', status: 'Черновик', streams: 0, revenue: 0 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Disc3" className="text-primary" size={28} />
            <span className="font-bold text-xl">MusicDist</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveSection('home')} className="text-sm font-medium hover:text-primary transition-colors">
              Главная
            </button>
            <button onClick={() => setActiveSection('pricing')} className="text-sm font-medium hover:text-primary transition-colors">
              Тарифы
            </button>
            <button onClick={() => setActiveSection('platforms')} className="text-sm font-medium hover:text-primary transition-colors">
              Платформы
            </button>
            <button onClick={() => setActiveSection('smartlinks')} className="text-sm font-medium hover:text-primary transition-colors">
              Смартлинки
            </button>
            <button onClick={() => setActiveSection('faq')} className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </button>
            <button onClick={() => setActiveSection('blog')} className="text-sm font-medium hover:text-primary transition-colors">
              Блог
            </button>
            <button onClick={() => setActiveSection('support')} className="text-sm font-medium hover:text-primary transition-colors">
              Поддержка
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {!isDashboard ? (
              <>
                <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">Вход</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Добро пожаловать</DialogTitle>
                      <DialogDescription>Войдите или создайте новый аккаунт</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Вход</TabsTrigger>
                        <TabsTrigger value="register">Регистрация</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Пароль</Label>
                          <Input id="password" type="password" />
                        </div>
                        <Button className="w-full" onClick={() => { setIsAuthOpen(false); setIsDashboard(true); }}>
                          Войти
                        </Button>
                      </TabsContent>
                      <TabsContent value="register" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="artist">Имя артиста</Label>
                          <Input id="artist" placeholder="DJ Shadow" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Email</Label>
                          <Input id="reg-email" type="email" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Пароль</Label>
                          <Input id="reg-password" type="password" />
                        </div>
                        <Button className="w-full" onClick={() => { setIsAuthOpen(false); setIsDashboard(true); }}>
                          Создать аккаунт
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button size="sm">Начать бесплатно</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsDashboard(false)}>
                  <Icon name="LayoutDashboard" size={18} className="mr-2" />
                  Кабинет
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="User" size={18} />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {!isDashboard ? (
        <>
          {activeSection === 'home' && (
            <>
              <section className="py-20 md:py-32 bg-gradient-to-b from-secondary/20 to-background">
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <Badge className="mb-6" variant="secondary">
                      🎵 Доверие 15 000+ артистов
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                      Дистрибуция музыки на все платформы за один клик
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Spotify, Apple Music, VK, Яндекс Музыка и ещё 150+ площадок. Загружайте релизы, получайте статистику и выводите деньги
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" className="text-lg px-8" onClick={() => setIsAuthOpen(true)}>
                        Загрузить релиз
                        <Icon name="Upload" size={20} className="ml-2" />
                      </Button>
                      <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => setActiveSection('platforms')}>
                        Посмотреть платформы
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-16 border-t">
                <div className="container mx-auto px-4">
                  <div className="grid md:grid-cols-3 gap-8">
                    <Card className="text-center hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="Zap" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Быстрая публикация</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Релизы выходят на платформы за 3-5 дней после модерации</p>
                      </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="BarChart3" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Детальная аналитика</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Следите за прослушиваниями и доходами по каждой площадке</p>
                      </CardContent>
                    </Card>

                    <Card className="text-center hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="Wallet" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Прозрачные выплаты</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Выводите роялти от 4000₽ на карту или PayPal</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeSection === 'pricing' && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Тарифы</h2>
                  <p className="text-muted-foreground text-lg">Выберите план под ваши задачи</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {pricingPlans.map((plan) => (
                    <Card key={plan.name} className={plan.popular ? 'border-primary border-2 relative' : ''}>
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Популярный</Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>
                          <span className="text-3xl font-bold text-foreground">{plan.price}₽</span>
                          <span className="text-muted-foreground">/{plan.period}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <Icon name="Check" className="text-primary mt-0.5" size={18} />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'}>
                          Выбрать план
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'platforms' && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Платформы дистрибуции</h2>
                  <p className="text-muted-foreground text-lg">Ваша музыка на всех главных площадках</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                  {platforms.map((platform) => (
                    <Card key={platform.name} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardContent className="pt-6 pb-6">
                        <Icon name={platform.icon as any} className="mx-auto mb-3 text-primary" size={32} />
                        <p className="text-sm font-medium">{platform.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'smartlinks' && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Смартлинки</h2>
                  <p className="text-muted-foreground text-lg">Одна ссылка на все платформы</p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="release-name">Название релиза</Label>
                        <Input id="release-name" placeholder="Midnight Dreams" className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="artist-name">Артист</Label>
                        <Input id="artist-name" placeholder="DJ Shadow" className="mt-2" />
                      </div>
                      <div>
                        <Label>Платформы</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {platforms.slice(0, 4).map((platform) => (
                            <div key={platform.name} className="flex items-center gap-2 p-3 border rounded-lg">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <Icon name={platform.icon as any} size={20} />
                              <span className="text-sm">{platform.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full">
                        <Icon name="Link" size={18} className="mr-2" />
                        Создать смартлинк
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeSection === 'faq' && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Вопросы и ответы</h2>
                  <p className="text-muted-foreground text-lg">Ответы на частые вопросы</p>
                </div>
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          )}

          {activeSection === 'blog' && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Блог</h2>
                  <p className="text-muted-foreground text-lg">Полезные статьи для артистов</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {[
                    { title: 'Как оптимизировать обложку релиза', category: 'Маркетинг' },
                    { title: '5 ошибок при загрузке треков', category: 'Инструкции' },
                    { title: 'Правила модерации на стримингах', category: 'Гайды' }
                  ].map((post, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">15 ноября 2024</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'support' && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Поддержка</h2>
                  <p className="text-muted-foreground text-lg">Мы всегда на связи</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <Icon name="MessageCircle" className="text-primary mb-2" size={28} />
                      <CardTitle>Чат поддержки</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">Ответим в течение 2 часов</p>
                      <Button className="w-full">Открыть чат</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Icon name="Mail" className="text-primary mb-2" size={28} />
                      <CardTitle>Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">support@musicdist.ru</p>
                      <Button variant="outline" className="w-full">Написать письмо</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Управляйте релизами и следите за статистикой</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Всего прослушиваний</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12,450</div>
                  <p className="text-xs text-green-600 mt-1">+18% за месяц</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Доход</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,890₽</div>
                  <p className="text-xs text-muted-foreground mt-1">Доступно к выводу</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Активных релизов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground mt-1">2 на модерации</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Мои релизы</h2>
              <Button>
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить релиз
              </Button>
            </div>

            <div className="space-y-4">
              {mockReleases.map((release, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg flex items-center justify-center">
                          <Icon name="Music" className="text-primary" size={28} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{release.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant={release.status === 'Опубликован' ? 'default' : 'secondary'}>
                              {release.status}
                            </Badge>
                            {release.status === 'Опубликован' && (
                              <span className="text-sm text-muted-foreground">
                                {release.streams.toLocaleString()} прослушиваний
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {release.status === 'Опубликован' ? (
                          <>
                            <div className="text-2xl font-bold">{release.revenue}₽</div>
                            <p className="text-xs text-muted-foreground">доход</p>
                          </>
                        ) : release.status === 'На проверке' ? (
                          <div className="w-48">
                            <p className="text-sm mb-2 text-muted-foreground">Модерация</p>
                            <Progress value={65} />
                          </div>
                        ) : (
                          <Button variant="outline">Продолжить</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t mt-16 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Disc3" className="text-primary" size={24} />
                <span className="font-bold text-lg">MusicDist</span>
              </div>
              <p className="text-sm text-muted-foreground">Профессиональная дистрибуция музыки на все платформы</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveSection('pricing')}>Тарифы</button></li>
                <li><button onClick={() => setActiveSection('platforms')}>Платформы</button></li>
                <li><button onClick={() => setActiveSection('smartlinks')}>Смартлинки</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Помощь</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveSection('faq')}>FAQ</button></li>
                <li><button onClick={() => setActiveSection('support')}>Поддержка</button></li>
                <li><button onClick={() => setActiveSection('blog')}>Блог</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@musicdist.ru</li>
                <li>+7 (495) 123-45-67</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 MusicDist. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
