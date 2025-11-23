import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/packages/shared-ui/components/ui/dialog';
import { Alert, AlertDescription } from '@/packages/shared-ui/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: {
    type: 'iframe' | 'video' | null;
    url: string | null;
  } | null;
  episodeTitle: string;
  isLoading?: boolean;
}

export const VideoPlayerModal = ({
  isOpen,
  onClose,
  videoData,
  episodeTitle,
  isLoading = false,
}: VideoPlayerModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>{episodeTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando player...</p>
            </div>
          )}

          {!isLoading && !videoData?.url && (
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Não foi possível carregar o vídeo. Tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && videoData?.url && videoData.type === 'iframe' && (
            <iframe
              src={videoData.url}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="no-referrer"
            />
          )}

          {!isLoading && videoData?.url && videoData.type === 'video' && (
            <video
              src={videoData.url}
              className="w-full h-full"
              controls
              autoPlay
              controlsList="nodownload"
            >
              Seu navegador não suporta a tag de vídeo.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
