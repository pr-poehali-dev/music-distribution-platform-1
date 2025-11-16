import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SmartLinkData {
  releaseName: string;
  artistName: string;
  coverUrl?: string;
  platforms: { name: string; url: string }[];
}

const SmartLinkView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [smartLink, setSmartLink] = useState<SmartLinkData | null>(null);

  useEffect(() => {
    const savedLinks = localStorage.getItem('olprod_smartlinks');
    if (savedLinks) {
      try {
        const links = JSON.parse(savedLinks);
        const link = links.find((l: any) => l.slug === slug);
        if (link) {
          setSmartLink({
            releaseName: link.releaseName,
            artistName: link.artistName,
            coverUrl: link.coverUrl,
            platforms: link.platforms
          });
        }
      } catch (e) {
        console.error('Failed to load smartlink:', e);
      }
    }
  }, [slug]);

  if (!smartLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Icon name="Music" className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h2 className="text-2xl font-bold mb-2">Смартлинк не найден</h2>
            <p className="text-muted-foreground">Возможно, ссылка устарела или была удалена</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardContent className="p-8">
          {smartLink.coverUrl && (
            <div className="mb-6">
              <img 
                src={smartLink.coverUrl} 
                alt={smartLink.releaseName}
                className="w-full aspect-square rounded-lg object-cover shadow-lg"
              />
            </div>
          )}
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{smartLink.releaseName}</h1>
            <p className="text-lg text-muted-foreground">{smartLink.artistName}</p>
          </div>

          <div className="space-y-3">
            {smartLink.platforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-between text-lg h-14 hover:bg-accent transition-all hover:scale-105"
                >
                  <span className="font-semibold">{platform.name}</span>
                  <Icon name="ExternalLink" size={20} />
                </Button>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Создано на OLPROD</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartLinkView;
