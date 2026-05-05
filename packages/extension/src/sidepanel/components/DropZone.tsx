import type { DragEvent } from 'react';
import { useState } from 'react';
import type { PendingScrap } from '../../types';

interface DropZoneProps {
  pendingScrap: PendingScrap | null;
  onTextDrop: (text: string) => void | Promise<void>;
  onImageDrop: (file: File) => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onClear: () => void;
  isSaving?: boolean;
  savingLabel?: string;
  saveLabel?: string;
  saveError?: string | null;
  saveNotice?: string | null;
  canSave?: boolean;
  authNotice?: string | null;
  onLogin?: () => void;
}

export const DropZone = ({
  pendingScrap,
  onTextDrop,
  onImageDrop,
  onSave,
  onClear,
  isSaving = false,
  savingLabel = 'Saving...',
  saveLabel = 'Save',
  saveError = null,
  saveNotice = null,
  canSave = true,
  authNotice = null,
  onLogin,
}: DropZoneProps) => {
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
    setError(null);

    const imageFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith('image/')
    );

    if (imageFile) {
      await onImageDrop(imageFile);
      return;
    }

    const droppedText = event.dataTransfer.getData('text/plain').trim();
    if (droppedText.length < 10) {
      setError('Drop at least 10 characters.');
      return;
    }

    await onTextDrop(droppedText);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={[
        'rounded-[24px] border-2 border-dashed bg-[#181c1f] p-6 text-center transition-all duration-300',
        isOver
          ? 'border-[#00ffc2] bg-[#00ffc2]/10 shadow-[0_0_24px_rgba(0,255,194,0.14)]'
          : 'border-[#00ffc2]/30',
      ].join(' ')}
    >
      <div className="space-y-2">
        <div className="text-xl font-black text-[#00ffc2]">+</div>
        <p className="text-sm font-medium uppercase text-[#e0e3e7]">
          {isOver ? 'Drop to capture' : 'Collect source material'}
        </p>
        <p className="text-xs text-[#b9cbc1]">Drag text, image, or a link to prepare it.</p>
      </div>

      <div className="mt-4 rounded-lg border border-[#00ffc2]/20 p-3 text-sm text-[#b9cbc1]">
        One saved source becomes one knowledge card.
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {saveError ? (
        <p className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {saveError}
        </p>
      ) : null}

      {saveNotice ? (
        <div className="mt-4 rounded-md border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-3 py-2 text-xs text-[#00ffc2]">
          <p>{saveNotice}</p>
        </div>
      ) : null}

      {pendingScrap ? (
        <div className="mt-4 rounded-lg border border-[#00ffc2]/30 bg-[#00ffc2]/10 p-3 text-left">
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ffc2]">
              Source preview
            </span>
            <button onClick={onClear} className="text-[#b9cbc1] hover:text-white" aria-label="Clear source">
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-[#e0e3e7]">
            {pendingScrap.raw_content ?? pendingScrap.title}
          </p>
          {pendingScrap.image_preview_url ? (
            <img
              src={pendingScrap.image_preview_url}
              alt={pendingScrap.title}
              className="mt-3 max-h-40 w-full rounded-md object-cover"
            />
          ) : null}

          {authNotice ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-[#101417]/70 p-3">
              <p className="text-xs leading-5 text-[#b9cbc1]">{authNotice}</p>
              {onLogin ? (
                <button
                  type="button"
                  onClick={onLogin}
                  className="mt-2 w-full rounded-lg bg-[#00ffc2] py-2 text-xs font-bold text-black transition hover:opacity-90"
                >
                  Login to save
                </button>
              ) : null}
            </div>
          ) : null}

          {canSave ? (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="mt-3 w-full rounded-lg bg-[#00ffc2] py-2 text-sm font-bold text-black transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isSaving ? savingLabel : saveLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
