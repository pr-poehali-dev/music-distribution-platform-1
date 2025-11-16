import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { AISupportChat } from '@/components/AISupportChat';

const API_AUTH = 'https://functions.poehali.dev/3a6da1d1-e103-4ce2-b766-907e6a900592';
const API_RELEASES = 'https://functions.poehali.dev/ea3b8978-849d-4e2d-ae73-dec1cb43ffc2';

interface User {
  id: number;
  artistName: string;
  email: string;
}

interface Release {
  id: number;
  title: string;
  genre: string;
  status: string;
  streams: number;
  revenue: number;
  releaseDate?: string;
  description?: string;
  musicAuthor?: string;
  lyricsAuthor?: string;
  audioUrl?: string;
  coverUrl?: string;
}

interface SmartLink {
  id: string;
  releaseName: string;
  artistName: string;
  platforms: { name: string; url: string }[];
}

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [dashboardTab, setDashboardTab] = useState('releases');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAudioUploadOpen, setIsAudioUploadOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'crystal'>('light');
  const [releases, setReleases] = useState<Release[]>([]);
  const [smartLinks, setSmartLinks] = useState<SmartLink[]>([]);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [currentReleaseId, setCurrentReleaseId] = useState<number | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regArtistName, setRegArtistName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [newRelease, setNewRelease] = useState({
    title: '',
    genre: '',
    releaseDate: '',
    description: '',
    musicAuthor: '',
    lyricsAuthor: ''
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [newSmartLink, setNewSmartLink] = useState({
    releaseName: '',
    platformLinks: [
      { name: 'Spotify', url: '' },
      { name: 'Apple Music', url: '' },
      { name: 'VK Музыка', url: '' },
      { name: 'Яндекс Музыка', url: '' }
    ]
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'crystal');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      loadReleases();
    }
  }, [user]);

  const platforms = [
    { name: 'Spotify', icon: 'Music2' },
    { name: 'Apple Music', icon: 'Music' },
    { name: 'VK Музыка', icon: 'Radio' },
    { name: 'Яндекс Музыка', icon: 'Disc3' },
    { name: 'YouTube Music', icon: 'Youtube' },
    { name: 'Deezer', icon: 'Music4' }
  ];

  const totalRevenue = releases.reduce((sum, r) => sum + r.revenue, 0);
  const totalStreams = releases.reduce((sum, r) => sum + r.streams, 0);

  const validateAudioFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.wav')) {
      toast({ 
        title: 'Ошибка формата', 
        description: 'Аудио должно быть в формате WAV',
        variant: 'destructive' 
      });
      return false;
    }
    return true;
  };

  const validateCoverImage = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        if (img.width !== img.height) {
          toast({ 
            title: 'Ошибка размера', 
            description: 'Обложка должна быть квадратной',
            variant: 'destructive' 
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateAudioFile(file)) {
      setAudioFile(file);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && await validateCoverImage(file)) {
      setCoverFile(file);
    }
  };

  const loadReleases = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_RELEASES}?userId=${user.id}`);
      const data = await response.json();
      setReleases(data.releases || []);
    } catch (error) {
      console.error('Error loading releases:', error);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthOpen(false);
        toast({ title: 'Успешно!', description: 'Вы вошли в систему' });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Ошибка входа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const handleRegister = async () => {
    if (!regArtistName || !regEmail || !regPassword) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'register', 
          email: regEmail, 
          password: regPassword,
          artistName: regArtistName 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthOpen(false);
        toast({ title: 'Успешно!', description: `Добро пожаловать, ${regArtistName}!` });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Ошибка регистрации', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setReleases([]);
    setActiveSection('home');
    toast({ title: 'Выход', description: 'Вы вышли из системы' });
  };

  const handleUploadRelease = async () => {
    if (!newRelease.title || !newRelease.genre) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    if (!user) return;

    try {
      const response = await fetch(API_RELEASES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...newRelease
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentReleaseId(data.release.id);
        setIsUploadOpen(false);
        setIsAudioUploadOpen(true);
        setNewRelease({ title: '', genre: '', releaseDate: '', description: '', musicAuthor: '', lyricsAuthor: '', featuredArtists: [] });
        setFeaturedArtistInput('');
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Ошибка создания', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const handleUploadFiles = async () => {
    if (!audioFile || !coverFile) {
      toast({ title: 'Ошибка', description: 'Загрузите аудио и обложку', variant: 'destructive' });
      return;
    }

    if (!currentReleaseId || !user) return;

    toast({ title: 'Загрузка...', description: 'Файлы загружаются на сервер' });

    try {
      const response = await fetch(API_RELEASES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          releaseId: currentReleaseId,
          status: 'На модерации',
          audioUrl: audioFile.name,
          coverUrl: coverFile.name
        })
      });

      if (response.ok) {
        setIsAudioUploadOpen(false);
        setAudioFile(null);
        setCoverFile(null);
        setCurrentReleaseId(null);
        loadReleases();
        toast({ title: 'Успешно!', description: 'Релиз отправлен на модерацию' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка загрузки файлов', variant: 'destructive' });
    }
  };

  const handleEditRelease = (release: Release) => {
    setEditingRelease(release);
    setIsEditOpen(true);
  };

  const handleUpdateRelease = async () => {
    if (!editingRelease || !user) return;

    try {
      const response = await fetch(API_RELEASES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          releaseId: editingRelease.id,
          title: editingRelease.title,
          genre: editingRelease.genre,
          releaseDate: editingRelease.releaseDate,
          description: editingRelease.description,
          musicAuthor: editingRelease.musicAuthor,
          lyricsAuthor: editingRelease.lyricsAuthor
        })
      });

      if (response.ok) {
        setIsEditOpen(false);
        setEditingRelease(null);
        loadReleases();
        toast({ title: 'Успешно!', description: 'Релиз обновлён' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const handleDeleteRelease = async (releaseId: number) => {
    if (!user) return;

    if (!confirm('Удалить этот релиз?')) return;

    try {
      const response = await fetch(API_RELEASES, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          releaseId: releaseId
        })
      });

      if (response.ok) {
        loadReleases();
        toast({ title: 'Успешно!', description: 'Релиз удалён' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка удаления', variant: 'destructive' });
    }
  };

  const handleCreateSmartLink = () => {
    if (!newSmartLink.releaseName) {
      toast({ title: 'Ошибка', description: 'Укажите название релиза', variant: 'destructive' });
      return;
    }

    const validLinks = newSmartLink.platformLinks.filter(p => p.url.trim() !== '');
    
    if (validLinks.length === 0) {
      toast({ title: 'Ошибка', description: 'Добавьте хотя бы одну ссылку', variant: 'destructive' });
      return;
    }

    const smartLink: SmartLink = {
      id: Date.now().toString(),
      releaseName: newSmartLink.releaseName,
      artistName: user?.artistName || '',
      platforms: validLinks
    };

    setSmartLinks([smartLink, ...smartLinks]);
    setNewSmartLink({
      releaseName: '',
      platformLinks: [
        { name: 'Spotify', url: '' },
        { name: 'Apple Music', url: '' },
        { name: 'VK Музыка', url: '' },
        { name: 'Яндекс Музыка', url: '' }
      ]
    });
    toast({ title: 'Смартлинк создан!', description: 'Поделитесь ссылкой со слушателями' });
  };

  const handleWithdraw = () => {
    if (totalRevenue < 100) {
      toast({ 
        title: 'Недостаточно средств', 
        description: `На счёте ${totalRevenue}₽. Минимальная сумма для вывода — 100₽`,
        variant: 'destructive' 
      });
      return;
    }

    const mailtoLink = `mailto:olprodlabel@gmail.com?subject=Запрос на вывод средств&body=Артист: ${user?.artistName}%0AEmail: ${user?.email}%0AСумма: ${totalRevenue}₽`;
    window.location.href = mailtoLink;
    setIsWithdrawOpen(false);
    toast({ title: 'Запрос отправлен', description: 'Мы свяжемся с вами в течение 1-2 дней' });
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast({ title: 'Требуется авторизация', description: 'Войдите или зарегистрируйтесь', variant: 'destructive' });
      setIsAuthOpen(true);
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="Palette" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Icon name="Sun" size={16} className="mr-2" />
                  Светлая
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Icon name="Moon" size={16} className="mr-2" />
                  Тёмная
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('crystal')}>
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Кристальная
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('home')}>
            <img src="https://cdn.poehali.dev/projects/33951d59-5d7e-47f4-880f-c2ae98b9913e/files/dc7a385c-d082-4a5b-89e7-4ee95e93f99c.jpg" alt="OLPROD Logo" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl">OLPROD</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveSection('home')} className="text-sm font-medium hover:text-primary transition-colors">
              Главная
            </button>
            <button onClick={() => setActiveSection('platforms')} className="text-sm font-medium hover:text-primary transition-colors">
              Платформы
            </button>
            <button onClick={() => requireAuth(() => setActiveSection('smartlinks'))} className="text-sm font-medium hover:text-primary transition-colors">
              Смартлинки
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="glass-button">Вход</Button>
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
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="your@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Пароль</Label>
                          <Input 
                            id="password" 
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                        </div>
                        <Button className="w-full" onClick={handleLogin}>
                          Войти
                        </Button>
                      </TabsContent>
                      <TabsContent value="register" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="artist">Псевдоним артиста *</Label>
                          <Input 
                            id="artist" 
                            placeholder="DJ Shadow"
                            value={regArtistName}
                            onChange={(e) => setRegArtistName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Email *</Label>
                          <Input 
                            id="reg-email" 
                            type="email" 
                            placeholder="your@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Пароль *</Label>
                          <Input 
                            id="reg-password" 
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                          />
                        </div>
                        <Button className="w-full" onClick={handleRegister}>
                          Создать аккаунт
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('dashboard')}>
                  <Icon name="LayoutDashboard" size={18} className="mr-2" />
                  Кабинет
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Icon name="User" size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-semibold">{user.artistName}</div>
                    <div className="px-2 py-1 text-xs text-muted-foreground">{user.email}</div>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      {activeSection === 'dashboard' && user ? (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Добро пожаловать, {user.artistName}</p>
            </div>

            <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="releases">Релизы</TabsTrigger>
                <TabsTrigger value="analytics">Аналитика</TabsTrigger>
              </TabsList>

              <TabsContent value="releases" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Всего прослушиваний</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalStreams.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Доход</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalRevenue}₽</div>
                      <p className="text-xs text-muted-foreground mt-1">Мин. вывод: 100₽</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Активных релизов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{releases.filter(r => r.status === 'Опубликован').length}</div>
                      <p className="text-xs text-muted-foreground mt-1">{releases.filter(r => r.status === 'На модерации').length} на модерации</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Мои релизы</h2>
                  <div className="flex gap-3">
                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="hover:scale-105 transition-transform">
                          <Icon name="Wallet" size={18} className="mr-2" />
                          Вывести
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Вывод средств</DialogTitle>
                          <DialogDescription>Текущий баланс: {totalRevenue}₽</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Минимальная сумма для вывода — 100₽. 
                            {totalRevenue >= 100 
                              ? ' Нажмите кнопку ниже, чтобы отправить запрос на вывод средств.' 
                              : ` Вам нужно еще ${100 - totalRevenue}₽.`}
                          </p>
                          <Button className="w-full" onClick={handleWithdraw} disabled={totalRevenue < 100}>
                            {totalRevenue >= 100 ? 'Отправить запрос' : 'Недостаточно средств'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                      <DialogTrigger asChild>
                        <Button className="hover:scale-105 transition-transform">
                          <Icon name="Upload" size={18} className="mr-2" />
                          Загрузить релиз
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Новый релиз</DialogTitle>
                          <DialogDescription>Заполните информацию о вашем релизе</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="release-title">Название релиза *</Label>
                            <Input 
                              id="release-title" 
                              placeholder="Midnight Dreams"
                              value={newRelease.title}
                              onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="artist-display">Артист</Label>
                            <Input 
                              id="artist-display" 
                              value={user.artistName}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="genre">Жанр *</Label>
                            <Select value={newRelease.genre} onValueChange={(value) => setNewRelease({ ...newRelease, genre: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите жанр" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pop">Pop</SelectItem>
                                <SelectItem value="rock">Rock</SelectItem>
                                <SelectItem value="electronic">Electronic</SelectItem>
                                <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                                <SelectItem value="jazz">Jazz</SelectItem>
                                <SelectItem value="classical">Classical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="release-date">Дата релиза</Label>
                            <Input 
                              id="release-date" 
                              type="date"
                              value={newRelease.releaseDate}
                              onChange={(e) => setNewRelease({ ...newRelease, releaseDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="music-author">Автор музыки *</Label>
                            <Input 
                              id="music-author" 
                              placeholder="Иван Иванов"
                              value={newRelease.musicAuthor}
                              onChange={(e) => setNewRelease({ ...newRelease, musicAuthor: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lyrics-author">Автор текста *</Label>
                            <Input 
                              id="lyrics-author" 
                              placeholder="Иван Иванов"
                              value={newRelease.lyricsAuthor}
                              onChange={(e) => setNewRelease({ ...newRelease, lyricsAuthor: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Другие артисты (feat.)</Label>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Имя артиста"
                                value={featuredArtistInput}
                                onChange={(e) => setFeaturedArtistInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && featuredArtistInput.trim()) {
                                    setNewRelease({ 
                                      ...newRelease, 
                                      featuredArtists: [...newRelease.featuredArtists, featuredArtistInput.trim()] 
                                    });
                                    setFeaturedArtistInput('');
                                  }
                                }}
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (featuredArtistInput.trim()) {
                                    setNewRelease({ 
                                      ...newRelease, 
                                      featuredArtists: [...newRelease.featuredArtists, featuredArtistInput.trim()] 
                                    });
                                    setFeaturedArtistInput('');
                                  }
                                }}
                              >
                                <Icon name="Plus" size={18} />
                              </Button>
                            </div>
                            {newRelease.featuredArtists.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newRelease.featuredArtists.map((artist, idx) => (
                                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                    {artist}
                                    <button
                                      onClick={() => {
                                        setNewRelease({
                                          ...newRelease,
                                          featuredArtists: newRelease.featuredArtists.filter((_, i) => i !== idx)
                                        });
                                      }}
                                      className="ml-1"
                                    >
                                      <Icon name="X" size={12} />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Описание</Label>
                            <Textarea 
                              id="description" 
                              placeholder="Расскажите о релизе..."
                              value={newRelease.description}
                              onChange={(e) => setNewRelease({ ...newRelease, description: e.target.value })}
                            />
                          </div>
                          <Button className="w-full hover:scale-105 transition-transform" onClick={handleUploadRelease}>
                            Продолжить
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Dialog open={isAudioUploadOpen} onOpenChange={setIsAudioUploadOpen}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Загрузка файлов</DialogTitle>
                      <DialogDescription>Загрузите аудио и обложку для вашего релиза</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="audio-file">Аудио файл (WAV) *</Label>
                        <Input 
                          id="audio-file" 
                          type="file"
                          accept=".wav"
                          onChange={handleAudioChange}
                        />
                        {audioFile && <p className="text-sm text-green-600">✓ {audioFile.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cover-file">Обложка (квадратная) *</Label>
                        <Input 
                          id="cover-file" 
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                        />
                        {coverFile && <p className="text-sm text-green-600">✓ {coverFile.name}</p>}
                      </div>
                      <Button className="w-full" onClick={handleUploadFiles} disabled={!audioFile || !coverFile}>
                        Отправить на модерацию
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Редактировать релиз</DialogTitle>
                    </DialogHeader>
                    {editingRelease && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Название релиза</Label>
                          <Input 
                            value={editingRelease.title}
                            onChange={(e) => setEditingRelease({ ...editingRelease, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Жанр</Label>
                          <Select value={editingRelease.genre} onValueChange={(value) => setEditingRelease({ ...editingRelease, genre: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pop">Pop</SelectItem>
                              <SelectItem value="rock">Rock</SelectItem>
                              <SelectItem value="electronic">Electronic</SelectItem>
                              <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                              <SelectItem value="jazz">Jazz</SelectItem>
                              <SelectItem value="classical">Classical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Автор музыки</Label>
                          <Input 
                            value={editingRelease.musicAuthor || ''}
                            onChange={(e) => setEditingRelease({ ...editingRelease, musicAuthor: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Автор текста</Label>
                          <Input 
                            value={editingRelease.lyricsAuthor || ''}
                            onChange={(e) => setEditingRelease({ ...editingRelease, lyricsAuthor: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Описание</Label>
                          <Textarea 
                            value={editingRelease.description || ''}
                            onChange={(e) => setEditingRelease({ ...editingRelease, description: e.target.value })}
                          />
                        </div>
                        <Button className="w-full" onClick={handleUpdateRelease}>
                          Сохранить изменения
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <div className="space-y-4">
                  {releases.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Icon name="Disc3" className="mx-auto mb-4 text-muted-foreground" size={48} />
                        <h3 className="text-xl font-semibold mb-2">Ничего не нашлось</h3>
                        <p className="text-muted-foreground mb-6">Загрузите свой первый релиз, чтобы начать</p>
                        <Button onClick={() => setIsUploadOpen(true)}>
                          <Icon name="Upload" size={18} className="mr-2" />
                          Загрузить релиз
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    releases.map((release) => (
                      <Card key={release.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg flex items-center justify-center">
                                <Icon name="Music" className="text-primary" size={28} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{release.title}</h3>
                                <p className="text-sm text-muted-foreground mb-1">{user.artistName}</p>
                                <div className="flex items-center gap-3">
                                  <Badge variant={release.status === 'Опубликован' ? 'default' : 'secondary'}>
                                    {release.status}
                                  </Badge>
                                  {release.genre && (
                                    <span className="text-sm text-muted-foreground">{release.genre}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {release.status === 'Опубликован' && (
                                <div className="text-right mr-4">
                                  <div className="text-2xl font-bold">{release.revenue}₽</div>
                                  <p className="text-xs text-muted-foreground">доход</p>
                                </div>
                              )}
                              {release.status === 'На модерации' && (
                                <div className="w-48 mr-4">
                                  <p className="text-sm mb-2 text-muted-foreground">Модерация</p>
                                  <Progress value={65} />
                                </div>
                              )}
                              {release.status === 'Черновик' && (
                                <Button variant="outline" size="sm" onClick={() => setIsAudioUploadOpen(true)}>
                                  Продолжить
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Icon name="MoreVertical" size={18} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditRelease(release)}>
                                    <Icon name="Edit" size={16} className="mr-2" />
                                    Редактировать
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteRelease(release.id)} className="text-destructive">
                                    <Icon name="Trash2" size={16} className="mr-2" />
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Прослушивания по платформам</CardTitle>
                      <CardDescription>Статистика за последние 30 дней</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {platforms.slice(0, 4).map((platform, idx) => (
                          <div key={platform.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon name={platform.icon as any} size={20} className="text-muted-foreground" />
                              <span className="text-sm">{platform.name}</span>
                            </div>
                            <span className="text-sm font-semibold">{(totalStreams * (0.4 - idx * 0.1)).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Доход по релизам</CardTitle>
                      <CardDescription>Топ релизов за месяц</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {releases.filter(r => r.status === 'Опубликован').length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Нет опубликованных релизов</p>
                      ) : (
                        <div className="space-y-4">
                          {releases.filter(r => r.status === 'Опубликован').map((release) => (
                            <div key={release.id} className="flex items-center justify-between">
                              <span className="text-sm">{release.title}</span>
                              <span className="text-sm font-semibold">{release.revenue}₽</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      ) : (
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
                      <Button size="lg" className="text-lg px-8 glass-button" onClick={() => setIsAuthOpen(true)}>
                        Попробовать
                        <Icon name="Sparkles" size={20} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-16 border-t">
                <div className="container mx-auto px-4">
                  <div className="grid md:grid-cols-3 gap-8">
                    <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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

                    <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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

                    <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="Wallet" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Прозрачные выплаты</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Выводите роялти от 100₽ на карту или PayPal</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </>
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
                    <Card key={platform.name} className="text-center glass-card transition-all hover:-translate-y-1">
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
                
                <Card className="mb-8">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="release-name">Название релиза *</Label>
                        <Input 
                          id="release-name" 
                          placeholder="Midnight Dreams" 
                          className="mt-2"
                          value={newSmartLink.releaseName}
                          onChange={(e) => setNewSmartLink({ ...newSmartLink, releaseName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="artist-name">Артист</Label>
                        <Input id="artist-name" value={user?.artistName || ''} disabled className="mt-2 bg-muted" />
                      </div>
                      <div>
                        <Label>Ссылки на платформы</Label>
                        <div className="space-y-3 mt-2">
                          {newSmartLink.platformLinks.map((platform, idx) => (
                            <div key={platform.name} className="flex items-center gap-3">
                              <div className="w-32 flex items-center gap-2">
                                <Icon name={platforms.find(p => p.name === platform.name)?.icon as any} size={18} />
                                <span className="text-sm">{platform.name}</span>
                              </div>
                              <Input 
                                placeholder="https://..."
                                value={platform.url}
                                onChange={(e) => {
                                  const updated = [...newSmartLink.platformLinks];
                                  updated[idx].url = e.target.value;
                                  setNewSmartLink({ ...newSmartLink, platformLinks: updated });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full hover:scale-105 transition-transform" onClick={handleCreateSmartLink}>
                        <Icon name="Link" size={18} className="mr-2" />
                        Создать смартлинк
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {smartLinks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Ваши смартлинки</h3>
                    {smartLinks.map((link) => (
                      <Card key={link.id}>
                        <CardContent className="p-6">
                          <h4 className="font-semibold mb-2">{link.releaseName}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{link.artistName}</p>
                          <div className="space-y-2">
                            {link.platforms.map((platform) => (
                              <div key={platform.name} className="flex items-center justify-between">
                                <span className="text-sm">{platform.name}</span>
                                <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  Открыть
                                </a>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      <footer className="border-t mt-16 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://cdn.poehali.dev/projects/33951d59-5d7e-47f4-880f-c2ae98b9913e/files/dc7a385c-d082-4a5b-89e7-4ee95e93f99c.jpg" alt="OLPROD Logo" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-lg">OLPROD</span>
              </div>
              <p className="text-sm text-muted-foreground">Профессиональная дистрибуция музыки на все платформы</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveSection('platforms')}>Платформы</button></li>
                <li><button onClick={() => requireAuth(() => setActiveSection('smartlinks'))}>Смартлинки</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>olprodlabel@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 OLPROD. Все права защищены.
          </div>
        </div>
      </footer>

      <AISupportChat />
    </div>
  );
};

export default Index;