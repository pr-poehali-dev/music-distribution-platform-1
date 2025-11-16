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
import { Checkbox } from '@/components/ui/checkbox';
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

interface Track {
  id: string;
  title: string;
  lyricsAuthor?: string;
  musicAuthor?: string;
  producer?: string;
  additionalArtists: string[];
  isrc?: string;
  hasExplicitContent: boolean;
  audioFile?: File | null;
  audioFileName?: string;
  lyricsText?: string;
  artistName?: string;
}

interface Release {
  id: number;
  title: string;
  genre: string;
  status: string;
  streams: number;
  revenue: number;
  releaseDate?: string;
  upc?: string;
  tracks: Track[];
  coverUrl?: string;
  isDeleted?: boolean;
  artistName?: string;
}

interface SmartLink {
  id: string;
  releaseName: string;
  artistName: string;
  platforms: { name: string; url: string }[];
  coverUrl?: string;
  isDeleted?: boolean;
  slug?: string;
}

const DRAFT_STORAGE_KEY = 'olprod_release_draft';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [dashboardTab, setDashboardTab] = useState('releases');
  const [smartLinksTab, setSmartLinksTab] = useState('active');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSmartLinkOpen, setIsSmartLinkOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isEditReleaseOpen, setIsEditReleaseOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'crystal' | 'blue'>('light');
  const [releases, setReleases] = useState<Release[]>([]);
  const [smartLinks, setSmartLinks] = useState<SmartLink[]>([]);
  const [uploadStep, setUploadStep] = useState(1);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [regArtistName, setRegArtistName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [withdrawCardNumber, setWithdrawCardNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [newRelease, setNewRelease] = useState({
    title: '',
    genre: '',
    releaseDate: '',
    upc: '',
    artistName: ''
  });

  const [tracks, setTracks] = useState<Track[]>([
    { 
      id: '1', 
      title: '', 
      lyricsAuthor: '', 
      musicAuthor: '', 
      producer: '', 
      additionalArtists: [], 
      isrc: '', 
      hasExplicitContent: false,
      audioFile: null,
      audioFileName: '',
      lyricsText: '',
      artistName: ''
    }
  ]);
  const [additionalArtistInput, setAdditionalArtistInput] = useState<{ [key: string]: string }>({});

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [smartLinkCoverFile, setSmartLinkCoverFile] = useState<File | null>(null);
  const [smartLinkCoverPreview, setSmartLinkCoverPreview] = useState<string | null>(null);

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
    document.documentElement.classList.remove('light', 'dark', 'crystal', 'blue');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      loadReleases();
    }
  }, [user]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft && !user) {
      try {
        const draft = JSON.parse(savedDraft);
        setNewRelease(draft.release || newRelease);
        setTracks(draft.tracks || tracks);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isUploadOpen && (newRelease.title || newRelease.genre || tracks.some(t => t.title))) {
      const draft = { release: newRelease, tracks };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [newRelease, tracks, isUploadOpen]);

  const platforms = [
    { name: 'Spotify', icon: 'Music2' },
    { name: 'Apple Music', icon: 'Music' },
    { name: 'VK Музыка', icon: 'Radio' },
    { name: 'Яндекс Музыка', icon: 'Disc3' },
    { name: 'YouTube Music', icon: 'Youtube' },
    { name: 'Deezer', icon: 'Music4' }
  ];

  const activeReleases = releases.filter(r => !r.isDeleted);
  const deletedReleases = releases.filter(r => r.isDeleted);
  const activeSmartLinks = smartLinks.filter(s => !s.isDeleted);
  const deletedSmartLinks = smartLinks.filter(s => s.isDeleted);
  const totalRevenue = 0;
  const totalStreams = activeReleases.reduce((sum, r) => sum + r.streams, 0);

  const validateCoverImage = async (file: File, requiredSize: number = 3000): Promise<boolean> => {
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
        } else if (img.width !== requiredSize || img.height !== requiredSize) {
          toast({ 
            title: 'Ошибка размера', 
            description: `Обложка должна быть ${requiredSize}×${requiredSize} пикселей`,
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

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && await validateCoverImage(file)) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSmartLinkCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && await validateCoverImage(file)) {
      setSmartLinkCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSmartLinkCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const handleResetPassword = async () => {
    if (!resetEmail || !resetNewPassword) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reset_password', 
          email: resetEmail, 
          newPassword: resetNewPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsForgotPasswordOpen(false);
        setResetEmail('');
        setResetNewPassword('');
        toast({ title: 'Успешно!', description: 'Пароль успешно изменён' });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Ошибка смены пароля', variant: 'destructive' });
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

  const handleNextStep = () => {
    if (uploadStep === 1) {
      if (!newRelease.title || !newRelease.genre) {
        toast({ title: 'Ошибка', description: 'Заполните название и жанр', variant: 'destructive' });
        return;
      }
      setUploadStep(2);
    } else if (uploadStep === 2) {
      if (tracks.some(t => !t.title)) {
        toast({ title: 'Ошибка', description: 'Заполните названия всех треков', variant: 'destructive' });
        return;
      }
      setUploadStep(3);
    }
  };

  const handlePrevStep = () => {
    if (uploadStep > 1) {
      setUploadStep(uploadStep - 1);
    }
  };

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      title: '',
      lyricsAuthor: '',
      musicAuthor: '',
      producer: '',
      additionalArtists: [],
      isrc: '',
      hasExplicitContent: false,
      audioFile: null,
      audioFileName: '',
      lyricsText: '',
      artistName: ''
    };
    setTracks([...tracks, newTrack]);
  };

  const handleTrackAudioChange = (trackId: string, file: File | null) => {
    if (file && !file.name.toLowerCase().endsWith('.wav')) {
      toast({ title: 'Ошибка', description: 'Загружайте только WAV файлы', variant: 'destructive' });
      return;
    }
    setTracks(tracks.map(t => t.id === trackId ? { ...t, audioFile: file, audioFileName: file?.name || '' } : t));
  };

  const handleEditRelease = (release: Release) => {
    setEditingRelease(release);
    setIsEditReleaseOpen(true);
  };

  const handleSaveEditedRelease = () => {
    if (!editingRelease) return;
    
    setReleases(releases.map(r => r.id === editingRelease.id ? editingRelease : r));
    setIsEditReleaseOpen(false);
    setEditingRelease(null);
    toast({ title: 'Сохранено', description: 'Изменения сохранены' });
  };

  const handleRemoveTrack = (trackId: string) => {
    if (tracks.length === 1) {
      toast({ title: 'Ошибка', description: 'Должен быть хотя бы один трек', variant: 'destructive' });
      return;
    }
    setTracks(tracks.filter(t => t.id !== trackId));
  };

  const handleTrackChange = (trackId: string, field: keyof Track, value: any) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, [field]: value } : t));
  };

  const handleEditTrackChange = (trackId: string, field: keyof Track, value: any) => {
    if (!editingRelease) return;
    const updatedTracks = editingRelease.tracks.map(t => t.id === trackId ? { ...t, [field]: value } : t);
    setEditingRelease({ ...editingRelease, tracks: updatedTracks });
  };

  const handleAddAdditionalArtist = (trackId: string) => {
    const input = additionalArtistInput[trackId] || '';
    if (!input.trim()) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      handleTrackChange(trackId, 'additionalArtists', [...track.additionalArtists, input.trim()]);
      setAdditionalArtistInput({ ...additionalArtistInput, [trackId]: '' });
    }
  };

  const handleRemoveAdditionalArtist = (trackId: string, index: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      const newArtists = track.additionalArtists.filter((_, i) => i !== index);
      handleTrackChange(trackId, 'additionalArtists', newArtists);
    }
  };

  const handleUploadRelease = async () => {
    if (!coverFile) {
      toast({ title: 'Ошибка', description: 'Загрузите обложку 3000×3000', variant: 'destructive' });
      return;
    }

    if (!user) return;

    toast({ title: 'Загрузка...', description: 'Релиз отправляется на модерацию' });

    try {
      const response = await fetch(API_RELEASES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...newRelease,
          tracks,
          coverUrl: coverPreview,
          status: 'На модерации'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsUploadOpen(false);
        setUploadStep(1);
        setNewRelease({ title: '', genre: '', releaseDate: '', upc: '' });
        setTracks([{ id: '1', title: '', lyricsAuthor: '', musicAuthor: '', producer: '', additionalArtists: [], isrc: '', hasExplicitContent: false }]);
        setCoverFile(null);
        setCoverPreview(null);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        loadReleases();
        toast({ title: 'Успешно!', description: 'Релиз отправлен на модерацию' });
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Ошибка создания', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const handleDeleteRelease = async (releaseId: number) => {
    if (!user) return;

    const release = releases.find(r => r.id === releaseId);
    if (!release) return;

    setReleases(releases.map(r => r.id === releaseId ? { ...r, isDeleted: true } : r));
    toast({ title: 'Перемещено', description: 'Релиз перемещён в корзину' });
  };

  const handleRestoreRelease = async (releaseId: number) => {
    if (!user) return;

    setReleases(releases.map(r => r.id === releaseId ? { ...r, isDeleted: false } : r));
    toast({ title: 'Восстановлено', description: 'Релиз восстановлен' });
  };

  const handleDeletePermanently = async (releaseId: number) => {
    if (!user) return;

    if (!confirm('Удалить релиз навсегда? Это действие нельзя отменить.')) return;

    try {
      const response = await fetch(API_RELEASES, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          releaseId: releaseId,
          permanent: true
        })
      });

      if (response.ok) {
        setReleases(releases.filter(r => r.id !== releaseId));
        toast({ title: 'Удалено', description: 'Релиз полностью удалён из базы данных' });
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

    const slug = `${newSmartLink.releaseName.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-')}-${Date.now()}`;
    
    const smartLink: SmartLink = {
      id: Date.now().toString(),
      releaseName: newSmartLink.releaseName,
      artistName: user?.artistName || '',
      platforms: validLinks,
      coverUrl: smartLinkCoverPreview || undefined,
      isDeleted: false,
      slug: slug
    };

    const updatedSmartLinks = [smartLink, ...smartLinks];
    setSmartLinks(updatedSmartLinks);
    
    const savedLinks = localStorage.getItem('olprod_smartlinks');
    const allLinks = savedLinks ? JSON.parse(savedLinks) : [];
    allLinks.push(smartLink);
    localStorage.setItem('olprod_smartlinks', JSON.stringify(allLinks));
    
    setNewSmartLink({
      releaseName: '',
      platformLinks: [
        { name: 'Spotify', url: '' },
        { name: 'Apple Music', url: '' },
        { name: 'VK Музыка', url: '' },
        { name: 'Яндекс Музыка', url: '' }
      ]
    });
    setSmartLinkCoverFile(null);
    setSmartLinkCoverPreview(null);
    setIsSmartLinkOpen(false);
    
    const smartLinkUrl = `${window.location.origin}/smartlink/${slug}`;
    navigator.clipboard.writeText(smartLinkUrl);
    toast({ 
      title: 'Смартлинк создан!', 
      description: `Ссылка скопирована в буфер обмена` 
    });
  };

  const handleDeleteSmartLink = (smartLinkId: string) => {
    setSmartLinks(smartLinks.map(s => s.id === smartLinkId ? { ...s, isDeleted: true } : s));
    toast({ title: 'Перемещено', description: 'Смартлинк перемещён в корзину' });
  };

  const handleRestoreSmartLink = (smartLinkId: string) => {
    setSmartLinks(smartLinks.map(s => s.id === smartLinkId ? { ...s, isDeleted: false } : s));
    toast({ title: 'Восстановлено', description: 'Смартлинк восстановлен' });
  };

  const handleDeleteSmartLinkPermanently = (smartLinkId: string) => {
    if (!confirm('Удалить смартлинк навсегда? Это действие нельзя отменить.')) return;
    setSmartLinks(smartLinks.filter(s => s.id !== smartLinkId));
    toast({ title: 'Удалено', description: 'Смартлинк удалён навсегда' });
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

    if (!withdrawCardNumber || !withdrawAmount) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 100 || amount > totalRevenue) {
      toast({ 
        title: 'Ошибка', 
        description: `Введите сумму от 100₽ до ${totalRevenue}₽`,
        variant: 'destructive' 
      });
      return;
    }

    setIsWithdrawOpen(false);
    setWithdrawCardNumber('');
    setWithdrawAmount('');
    toast({ title: 'Заявка принята', description: 'Средства будут переведены в течение 1-2 дней' });
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
      <header className="sticky top-0 z-50 border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
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
                <DropdownMenuItem onClick={() => setTheme('blue')}>
                  <Icon name="Droplet" size={16} className="mr-2" />
                  Синяя
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
            {user && (
              <button onClick={() => { setActiveSection('dashboard'); setDashboardTab('smartlinks'); }} className="text-sm font-medium hover:text-primary transition-colors">
                Смартлинки
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className={theme === 'crystal' ? 'glass-button' : ''}>Войти</Button>
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
                          <div className="relative">
                            <Input 
                              id="password" 
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                              <Icon name={showLoginPassword ? "EyeOff" : "Eye"} size={16} />
                            </Button>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleLogin}>
                          Войти
                        </Button>
                        <Button 
                          variant="link" 
                          className="w-full text-sm" 
                          onClick={() => {
                            setIsAuthOpen(false);
                            setIsForgotPasswordOpen(true);
                          }}
                        >
                          Забыли пароль?
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
                          <div className="relative">
                            <Input 
                              id="reg-password" 
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                            >
                              <Icon name={showRegPassword ? "EyeOff" : "Eye"} size={16} />
                            </Button>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleRegister}>
                          Создать аккаунт
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Восстановление пароля</DialogTitle>
                      <DialogDescription>Введите email и новый пароль</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input 
                          id="reset-email" 
                          type="email" 
                          placeholder="your@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reset-password">Новый пароль</Label>
                        <div className="relative">
                          <Input 
                            id="reset-password" 
                            type={showResetPassword ? "text" : "password"}
                            value={resetNewPassword}
                            onChange={(e) => setResetNewPassword(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                          >
                            <Icon name={showResetPassword ? "EyeOff" : "Eye"} size={16} />
                          </Button>
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleResetPassword}>
                        Изменить пароль
                      </Button>
                      <Button 
                        variant="link" 
                        className="w-full text-sm" 
                        onClick={() => {
                          setIsForgotPasswordOpen(false);
                          setIsAuthOpen(true);
                        }}
                      >
                        Вернуться ко входу
                      </Button>
                    </div>
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
                <p className="text-muted-foreground">Добро пожаловать, {user.artistName}</p>
              </div>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className={theme === 'crystal' ? 'glass-button' : ''}>
                    <Icon name="Upload" size={18} className="mr-2" />
                    Загрузить релиз
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Загрузить новый релиз</DialogTitle>
                    <DialogDescription>Шаг {uploadStep} из 3</DialogDescription>
                  </DialogHeader>

                  {uploadStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Название релиза *</Label>
                        <Input 
                          id="title"
                          placeholder="My New Track"
                          value={newRelease.title}
                          onChange={(e) => setNewRelease({...newRelease, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genre">Жанр *</Label>
                        <Select value={newRelease.genre} onValueChange={(value) => setNewRelease({...newRelease, genre: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите жанр" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pop">Pop</SelectItem>
                            <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                            <SelectItem value="Rap">Rap</SelectItem>
                            <SelectItem value="Rock">Rock</SelectItem>
                            <SelectItem value="Alternative Rock">Alternative Rock</SelectItem>
                            <SelectItem value="Indie Rock">Indie Rock</SelectItem>
                            <SelectItem value="Electronic">Electronic</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Techno">Techno</SelectItem>
                            <SelectItem value="Trance">Trance</SelectItem>
                            <SelectItem value="Dubstep">Dubstep</SelectItem>
                            <SelectItem value="Drum & Bass">Drum & Bass</SelectItem>
                            <SelectItem value="Jazz">Jazz</SelectItem>
                            <SelectItem value="Blues">Blues</SelectItem>
                            <SelectItem value="Classical">Classical</SelectItem>
                            <SelectItem value="R&B">R&B</SelectItem>
                            <SelectItem value="Soul">Soul</SelectItem>
                            <SelectItem value="Funk">Funk</SelectItem>
                            <SelectItem value="Reggae">Reggae</SelectItem>
                            <SelectItem value="Country">Country</SelectItem>
                            <SelectItem value="Folk">Folk</SelectItem>
                            <SelectItem value="Metal">Metal</SelectItem>
                            <SelectItem value="Punk">Punk</SelectItem>
                            <SelectItem value="Ambient">Ambient</SelectItem>
                            <SelectItem value="Lo-Fi">Lo-Fi</SelectItem>
                            <SelectItem value="Experimental">Experimental</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="releaseDate">Дата релиза</Label>
                        <Input 
                          id="releaseDate"
                          type="date"
                          value={newRelease.releaseDate}
                          onChange={(e) => setNewRelease({...newRelease, releaseDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="upc">UPC</Label>
                        <Input 
                          id="upc"
                          placeholder="0123456789012"
                          value={newRelease.upc}
                          onChange={(e) => setNewRelease({...newRelease, upc: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="release-artist">Исполнитель релиза</Label>
                        <Input 
                          id="release-artist"
                          placeholder={user?.artistName || 'Имя исполнителя'}
                          value={newRelease.artistName}
                          onChange={(e) => setNewRelease({...newRelease, artistName: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">Оставьте пустым для использования: {user?.artistName}</p>
                      </div>
                      <Button onClick={handleNextStep} className="w-full">
                        Далее
                        <Icon name="ArrowRight" size={18} className="ml-2" />
                      </Button>
                    </div>
                  )}

                  {uploadStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Треки</h3>
                        <Button variant="outline" size="sm" onClick={handleAddTrack}>
                          <Icon name="Plus" size={16} className="mr-2" />
                          Добавить трек
                        </Button>
                      </div>

                      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                        {tracks.map((track, index) => (
                          <Card key={track.id} className={theme === 'crystal' ? 'glass-card' : ''}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Трек {index + 1}</CardTitle>
                                {tracks.length > 1 && (
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveTrack(track.id)}>
                                    <Icon name="X" size={16} />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                <Label>Название трека *</Label>
                                <Input 
                                  placeholder="Track Title"
                                  value={track.title}
                                  onChange={(e) => handleTrackChange(track.id, 'title', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Автор слов</Label>
                                  <Input 
                                    placeholder="John Doe"
                                    value={track.lyricsAuthor}
                                    onChange={(e) => handleTrackChange(track.id, 'lyricsAuthor', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Автор музыки</Label>
                                  <Input 
                                    placeholder="Jane Smith"
                                    value={track.musicAuthor}
                                    onChange={(e) => handleTrackChange(track.id, 'musicAuthor', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Продюсер (необязательно)</Label>
                                <Input 
                                  placeholder="Producer Name"
                                  value={track.producer}
                                  onChange={(e) => handleTrackChange(track.id, 'producer', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Дополнительные исполнители</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="Добавить артиста"
                                    value={additionalArtistInput[track.id] || ''}
                                    onChange={(e) => setAdditionalArtistInput({...additionalArtistInput, [track.id]: e.target.value})}
                                  />
                                  <Button variant="outline" size="sm" onClick={() => handleAddAdditionalArtist(track.id)}>
                                    <Icon name="Plus" size={16} />
                                  </Button>
                                </div>
                                {track.additionalArtists.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {track.additionalArtists.map((artist, i) => (
                                      <Badge key={i} variant="secondary" className="gap-1">
                                        {artist}
                                        <button onClick={() => handleRemoveAdditionalArtist(track.id, i)}>
                                          <Icon name="X" size={12} />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>ISRC</Label>
                                <Input 
                                  placeholder="USRC12345678"
                                  value={track.isrc}
                                  onChange={(e) => handleTrackChange(track.id, 'isrc', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Исполнитель трека</Label>
                                <Input 
                                  placeholder={user?.artistName || 'Имя исполнителя'}
                                  value={track.artistName}
                                  onChange={(e) => handleTrackChange(track.id, 'artistName', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Оставьте пустым для {user?.artistName}</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Аудиофайл WAV</Label>
                                <Input 
                                  type="file"
                                  accept=".wav"
                                  onChange={(e) => handleTrackAudioChange(track.id, e.target.files?.[0] || null)}
                                />
                                {track.audioFileName && (
                                  <p className="text-sm text-muted-foreground">
                                    Загружено: {track.audioFileName}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Текст трека (лирика)</Label>
                                <Textarea 
                                  placeholder="Введите текст песни..."
                                  value={track.lyricsText}
                                  onChange={(e) => handleTrackChange(track.id, 'lyricsText', e.target.value)}
                                  rows={6}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`explicit-${track.id}`}
                                  checked={track.hasExplicitContent}
                                  onCheckedChange={(checked) => handleTrackChange(track.id, 'hasExplicitContent', checked)}
                                />
                                <Label htmlFor={`explicit-${track.id}`} className="cursor-pointer">
                                  Содержит ненормативную лексику
                                </Label>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handlePrevStep} className="w-full">
                          <Icon name="ArrowLeft" size={18} className="mr-2" />
                          Назад
                        </Button>
                        <Button onClick={handleNextStep} className="w-full">
                          Далее
                          <Icon name="ArrowRight" size={18} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploadStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cover">Обложка релиза 3000×3000 *</Label>
                        <Input 
                          id="cover"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                        />
                        {coverPreview && (
                          <div className="mt-4">
                            <img src={coverPreview} alt="Cover preview" className="w-48 h-48 rounded-lg object-cover border-2 border-border" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handlePrevStep} className="w-full">
                          <Icon name="ArrowLeft" size={18} className="mr-2" />
                          Назад
                        </Button>
                        <Button onClick={handleUploadRelease} className="w-full">
                          <Icon name="Upload" size={18} className="mr-2" />
                          Отправить на модерацию
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={isEditReleaseOpen} onOpenChange={setIsEditReleaseOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Редактировать релиз</DialogTitle>
                    <DialogDescription>Изменить информацию о треках</DialogDescription>
                  </DialogHeader>
                  {editingRelease && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{editingRelease.title}</h3>
                        <p className="text-sm text-muted-foreground">{editingRelease.genre}</p>
                      </div>
                      <div className="space-y-4">
                        {editingRelease.tracks.map((track, index) => (
                          <Card key={track.id} className={theme === 'crystal' ? 'glass-card' : ''}>
                            <CardHeader>
                              <CardTitle className="text-base">Трек {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                <Label>Название трека</Label>
                                <Input 
                                  value={track.title}
                                  onChange={(e) => handleEditTrackChange(track.id, 'title', e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Автор слов</Label>
                                  <Input 
                                    value={track.lyricsAuthor || ''}
                                    onChange={(e) => handleEditTrackChange(track.id, 'lyricsAuthor', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Автор музыки</Label>
                                  <Input 
                                    value={track.musicAuthor || ''}
                                    onChange={(e) => handleEditTrackChange(track.id, 'musicAuthor', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Продюсер</Label>
                                <Input 
                                  value={track.producer || ''}
                                  onChange={(e) => handleEditTrackChange(track.id, 'producer', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>ISRC</Label>
                                <Input 
                                  value={track.isrc || ''}
                                  onChange={(e) => handleEditTrackChange(track.id, 'isrc', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Исполнитель трека</Label>
                                <Input 
                                  placeholder={user?.artistName || 'Имя исполнителя'}
                                  value={track.artistName || ''}
                                  onChange={(e) => handleEditTrackChange(track.id, 'artistName', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Аудиофайл WAV</Label>
                                <Input 
                                  type="file"
                                  accept=".wav"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleEditTrackChange(track.id, 'audioFileName', file.name);
                                    }
                                  }}
                                />
                                {track.audioFileName && (
                                  <p className="text-sm text-muted-foreground">
                                    Загружено: {track.audioFileName}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Текст трека (лирика)</Label>
                                <Textarea 
                                  placeholder="Введите текст песни..."
                                  value={track.lyricsText || ''}
                                  onChange={(e) => handleEditTrackChange(track.id, 'lyricsText', e.target.value)}
                                  rows={6}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-explicit-${track.id}`}
                                  checked={track.hasExplicitContent}
                                  onCheckedChange={(checked) => handleEditTrackChange(track.id, 'hasExplicitContent', checked)}
                                />
                                <Label htmlFor={`edit-explicit-${track.id}`} className="cursor-pointer">
                                  Содержит ненормативную лексику
                                </Label>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button className="w-full" onClick={handleSaveEditedRelease}>
                        <Icon name="Save" size={18} className="mr-2" />
                        Сохранить изменения
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="releases">Релизы</TabsTrigger>
                <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                <TabsTrigger value="smartlinks">Смартлинки</TabsTrigger>
                <TabsTrigger value="trash">
                  Корзина
                  {(deletedReleases.length + deletedSmartLinks.length) > 0 && (
                    <Badge variant="destructive" className="ml-2">{deletedReleases.length + deletedSmartLinks.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="releases" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className={theme === 'crystal' ? 'glass-card' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Всего прослушиваний</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalStreams.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card className={theme === 'crystal' ? 'glass-card' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Общий доход</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalRevenue}₽</div>
                    </CardContent>
                  </Card>
                  <Card className={theme === 'crystal' ? 'glass-card' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Релизов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{activeReleases.length}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={totalRevenue < 100}>
                        <Icon name="Wallet" size={18} className="mr-2" />
                        Вывести средства
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Вывод средств</DialogTitle>
                        <DialogDescription>
                          Доступно для вывода: <span className="font-bold">{totalRevenue}₽</span>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Номер карты</Label>
                          <Input 
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={withdrawCardNumber}
                            onChange={(e) => setWithdrawCardNumber(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Сумма вывода (₽)</Label>
                          <Input 
                            id="amount"
                            type="number"
                            placeholder="100"
                            min="100"
                            max={totalRevenue}
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground">Минимальная сумма: 100₽</p>
                        </div>
                        <Button className="w-full" onClick={handleWithdraw}>
                          Подтвердить вывод
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {activeReleases.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Icon name="Music" className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-xl font-semibold mb-2">Нет релизов</h3>
                      <p className="text-muted-foreground mb-6">Загрузите свой первый трек</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {activeReleases.map((release) => (
                      <Card key={release.id} className={theme === 'crystal' ? 'glass-card' : ''}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {release.coverUrl ? (
                                <img src={release.coverUrl} alt={release.title} className="w-16 h-16 rounded-lg object-cover" />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                                  <Icon name="Music" className="text-primary" size={28} />
                                </div>
                              )}
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
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Прослушиваний</div>
                                <div className="text-xl font-bold">{release.streams.toLocaleString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Доход</div>
                                <div className="text-xl font-bold">0₽</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditRelease(release)}
                              >
                                <Icon name="Pencil" size={18} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteRelease(release.id)}
                              >
                                <Icon name="Trash2" size={18} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="smartlinks" className="space-y-6">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Смартлинки</h2>
                    <p className="text-muted-foreground">Одна ссылка для всех платформ</p>
                  </div>
                  <Dialog open={isSmartLinkOpen} onOpenChange={setIsSmartLinkOpen}>
                    <DialogTrigger asChild>
                      <Button className={theme === 'crystal' ? 'glass-button' : ''}>
                        <Icon name="Link" size={18} className="mr-2" />
                        Создать смартлинк
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Создать смартлинк</DialogTitle>
                        <DialogDescription>Добавьте ссылки на ваш релиз</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="smartlink-name">Название релиза</Label>
                          <Input 
                            id="smartlink-name"
                            placeholder="My Track"
                            value={newSmartLink.releaseName}
                            onChange={(e) => setNewSmartLink({...newSmartLink, releaseName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smartlink-cover">Обложка 3000×3000</Label>
                          <Input 
                            id="smartlink-cover"
                            type="file"
                            accept="image/*"
                            onChange={handleSmartLinkCoverChange}
                          />
                          {smartLinkCoverPreview && (
                            <img src={smartLinkCoverPreview} alt="Smart link cover" className="w-32 h-32 rounded-lg object-cover border-2 border-border mt-2" />
                          )}
                        </div>
                        {newSmartLink.platformLinks.map((platform, index) => (
                          <div key={platform.name} className="space-y-2">
                            <Label htmlFor={`link-${index}`}>{platform.name}</Label>
                            <Input 
                              id={`link-${index}`}
                              placeholder="https://..."
                              value={platform.url}
                              onChange={(e) => {
                                const updated = [...newSmartLink.platformLinks];
                                updated[index].url = e.target.value;
                                setNewSmartLink({...newSmartLink, platformLinks: updated});
                              }}
                            />
                          </div>
                        ))}
                        <Button className="w-full" onClick={handleCreateSmartLink}>
                          Создать
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Tabs value={smartLinksTab} onValueChange={setSmartLinksTab}>
                  <TabsList>
                    <TabsTrigger value="active">Активные</TabsTrigger>
                    <TabsTrigger value="deleted">
                      Удалённые
                      {deletedSmartLinks.length > 0 && (
                        <Badge variant="destructive" className="ml-2">{deletedSmartLinks.length}</Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="mt-6">
                    {activeSmartLinks.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Icon name="Link" className="mx-auto mb-4 text-muted-foreground" size={48} />
                          <h3 className="text-xl font-semibold mb-2">Нет смартлинков</h3>
                          <p className="text-muted-foreground">Создайте свой первый смартлинк</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {activeSmartLinks.map((link) => (
                          <Card key={link.id} className={theme === 'crystal' ? 'glass-card' : ''}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  {link.coverUrl ? (
                                    <img src={link.coverUrl} alt={link.releaseName} className="w-16 h-16 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                                      <Icon name="Music" className="text-primary" size={28} />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg">{link.releaseName}</h3>
                                    <p className="text-sm text-muted-foreground">{link.artistName}</p>
                                    {link.slug && (
                                      <button
                                        onClick={() => {
                                          const url = `${window.location.origin}/smartlink/${link.slug}`;
                                          navigator.clipboard.writeText(url);
                                          toast({ title: 'Скопировано!', description: 'Ссылка скопирована в буфер обмена' });
                                        }}
                                        className="text-xs text-primary hover:underline mt-1"
                                      >
                                        Скопировать ссылку
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteSmartLink(link.id)}
                                >
                                  <Icon name="Trash2" size={18} />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                {link.platforms.map((platform) => (
                                  <a 
                                    key={platform.name}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                                  >
                                    <Icon name="ExternalLink" size={16} />
                                    <span className="text-sm font-medium">{platform.name}</span>
                                  </a>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="deleted" className="mt-6">
                    {deletedSmartLinks.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Icon name="Trash2" className="mx-auto mb-4 text-muted-foreground" size={48} />
                          <h3 className="text-xl font-semibold mb-2">Нет удалённых смартлинков</h3>
                          <p className="text-muted-foreground">Удалённые смартлинки будут здесь</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {deletedSmartLinks.map((link) => (
                          <Card key={link.id} className="opacity-60 hover:opacity-100 transition-opacity">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {link.coverUrl ? (
                                    <img src={link.coverUrl} alt={link.releaseName} className="w-16 h-16 rounded-lg object-cover grayscale" />
                                  ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                                      <Icon name="Music" className="text-muted-foreground" size={28} />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg">{link.releaseName}</h3>
                                    <p className="text-sm text-muted-foreground mb-1">{link.artistName}</p>
                                    <Badge variant="outline" className="text-destructive">Удалён</Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleRestoreSmartLink(link.id)}
                                  >
                                    <Icon name="RotateCcw" size={16} className="mr-2" />
                                    Восстановить
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleDeleteSmartLinkPermanently(link.id)}
                                  >
                                    <Icon name="Trash2" size={16} className="mr-2" />
                                    Удалить навсегда
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className={theme === 'crystal' ? 'glass-card' : ''}>
                  <CardHeader>
                    <CardTitle>Статистика по платформам</CardTitle>
                    <CardDescription>Распределение прослушиваний</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {platforms.slice(0, 4).map((platform, i) => {
                      const percent = 0;
                      return (
                        <div key={platform.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{platform.name}</span>
                            <span className="text-muted-foreground">{percent}%</span>
                          </div>
                          <Progress value={percent} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className={theme === 'crystal' ? 'glass-card' : ''}>
                  <CardHeader>
                    <CardTitle>Топ релизов</CardTitle>
                    <CardDescription>По доходу</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeReleases.filter(r => r.status === 'Опубликован').length > 0 ? (
                      <div className="space-y-3">
                        {activeReleases.filter(r => r.status === 'Опубликован').map((release) => (
                          <div key={release.id} className="flex items-center justify-between">
                            <span className="text-sm">{release.title}</span>
                            <span className="text-sm font-semibold">0₽</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Нет опубликованных релизов</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trash" className="space-y-6">
                {(deletedReleases.length === 0 && deletedSmartLinks.length === 0) ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Icon name="Trash2" className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-xl font-semibold mb-2">Корзина пуста</h3>
                      <p className="text-muted-foreground">Удалённые релизы и смартлинки будут храниться здесь</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {deletedReleases.map((release) => (
                      <Card key={release.id} className="opacity-60 hover:opacity-100 transition-opacity">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {release.coverUrl ? (
                                <img src={release.coverUrl} alt={release.title} className="w-16 h-16 rounded-lg object-cover grayscale" />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                                  <Icon name="Music" className="text-muted-foreground" size={28} />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">{release.title}</h3>
                                <p className="text-sm text-muted-foreground mb-1">{user.artistName}</p>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-destructive">
                                    Удалён
                                  </Badge>
                                  {release.genre && (
                                    <span className="text-sm text-muted-foreground">{release.genre}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRestoreRelease(release.id)}
                              >
                                <Icon name="RotateCcw" size={16} className="mr-2" />
                                Восстановить
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDeletePermanently(release.id)}
                              >
                                <Icon name="Trash2" size={16} className="mr-2" />
                                Удалить навсегда
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {deletedSmartLinks.map((link) => (
                      <Card key={link.id} className="opacity-60 hover:opacity-100 transition-opacity">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {link.coverUrl ? (
                                <img src={link.coverUrl} alt={link.releaseName} className="w-16 h-16 rounded-lg object-cover grayscale" />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                                  <Icon name="Link" className="text-muted-foreground" size={28} />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">{link.releaseName}</h3>
                                <p className="text-sm text-muted-foreground mb-1">{link.artistName}</p>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-destructive">
                                    Удалён (Смартлинк)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRestoreSmartLink(link.id)}
                              >
                                <Icon name="RotateCcw" size={16} className="mr-2" />
                                Восстановить
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDeleteSmartLinkPermanently(link.id)}
                              >
                                <Icon name="Trash2" size={16} className="mr-2" />
                                Удалить навсегда
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
                  <div className="max-w-4xl mx-auto text-center">
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
                      <Button 
                        size="lg" 
                        className={`text-lg px-8 ${theme === 'crystal' ? 'glass-button' : ''}`} 
                        onClick={() => {
                          if (user) {
                            setActiveSection('dashboard');
                          } else {
                            setIsAuthOpen(true);
                          }
                        }}
                      >
                        {user ? 'Личный кабинет' : 'Попробовать бесплатно'}
                        <Icon name={user ? 'LayoutDashboard' : 'Sparkles'} size={20} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-16 border-t">
                <div className="container mx-auto px-4">
                  <div className="grid md:grid-cols-3 gap-8">
                    <Card className={`text-center ${theme === 'crystal' ? 'glass-card' : ''} hover:shadow-lg transition-all hover:-translate-y-1`}>
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="Zap" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Быстрая публикация</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Ваша музыка на всех платформах за 24-48 часов</p>
                      </CardContent>
                    </Card>

                    <Card className={`text-center ${theme === 'crystal' ? 'glass-card' : ''} hover:shadow-lg transition-all hover:-translate-y-1`}>
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="BarChart3" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Подробная аналитика</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Следите за прослушиваниями и доходами в реальном времени</p>
                      </CardContent>
                    </Card>

                    <Card className={`text-center ${theme === 'crystal' ? 'glass-card' : ''} hover:shadow-lg transition-all hover:-translate-y-1`}>
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <Icon name="Wallet" className="text-primary" size={24} />
                        </div>
                        <CardTitle>Быстрый вывод</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Получайте деньги напрямую на карту от 100₽</p>
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
                <div className="max-w-4xl mx-auto text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">150+ музыкальных платформ</h2>
                  <p className="text-lg text-muted-foreground">Ваша музыка будет доступна везде, где слушают миллионы</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {platforms.map((platform) => (
                    <Card key={platform.name} className={`${theme === 'crystal' ? 'glass-card' : ''} hover:shadow-lg transition-all`}>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name={platform.icon as any} className="text-primary" size={24} />
                        </div>
                        <div className="font-semibold">{platform.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}


        </>
      )}

      <AISupportChat />
    </div>
  );
};

export default Index;