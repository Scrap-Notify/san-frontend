import type { DragEvent } from 'react';
import { useState } from 'react';
import { CloudUpload, PencilLine, RotateCcw, Sparkles } from 'lucide-react';
import { CurvedButton } from '../../../../ui/src/components/Button/CurvedButton';
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
  savingLabel = '저장 중...',
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
      setError('10자 이상의 텍스트나 이미지를 드롭해 주세요.');
      return;
    }

    await onTextDrop(droppedText);
  };

  const previewContent = pendingScrap?.raw_content ?? pendingScrap?.title ?? '';

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={[
        'relative w-full overflow-hidden rounded-leaf border-2 border-dashed bg-surface-container p-4 transition-all duration-300',
        isOver
          ? 'border-primary-signal bg-primary-signal/10 shadow-neon glow-neon'
          : 'border-primary-signal/30',
      ].join(' ')}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-leaf border border-primary-signal/30 bg-primary-signal/10 text-primary-signal shadow-neon">
            <CloudUpload size={24} aria-hidden="true" />
          </div>

          <p className="text-body-main-bold text-text-primary">
            {isOver ? '여기에 놓아 지식으로 저장' : '텍스트, 이미지, 링크를 드롭'}
          </p>

          <p className="text-caption text-text-secondary">
            선택한 자료를 지식의 숲에 맞춰 정리합니다.
          </p>
        </div>

        <div className="flex min-h-[96px] w-full items-start gap-3 rounded-leaf border border-primary-signal/20 bg-surface-highest p-4 text-left">
          <PencilLine size={18} className="mt-0.5 shrink-0 text-primary-signal" aria-hidden="true" />
          <p className="text-caption leading-6 text-text-secondary">
            드롭한 내용은 먼저 이곳에 머물고, 저장하면 관련 지식 카드와 함께 정리됩니다.
          </p>
        </div>
      </div>

      {error || saveError ? (
        <p className="mt-4 rounded-leaf border border-red-500/20 bg-red-500/10 px-4 py-3 text-caption text-red-300">
          {error ?? saveError}
        </p>
      ) : null}

      {saveNotice ? (
        <div className="mt-4 rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-4 py-3 text-caption text-primary-signal">
          {saveNotice}
        </div>
      ) : null}

      {pendingScrap ? (
        <div className="mt-4 rounded-leaf border border-primary-signal/20 bg-surface-container p-4 shadow-neon">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary-signal" aria-hidden="true" />
              <span className="text-caption font-bold uppercase tracking-wide text-text-secondary">
                Captured Source
              </span>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-caption font-bold uppercase tracking-wide text-primary-signal transition hover:text-text-primary active:translate-y-px"
              aria-label="Clear source"
              title="Clear source"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Clear
            </button>
          </div>

          <div className="max-h-[220px] overflow-y-auto rounded-leaf border border-primary-signal/10 bg-background/40 p-4">
            <p className="whitespace-pre-wrap text-body-main text-text-secondary">
              {previewContent}
            </p>

            {pendingScrap.image_preview_url ? (
              <img
                src={pendingScrap.image_preview_url}
                alt={pendingScrap.title}
                className="mt-4 max-h-40 w-full rounded-leaf object-cover"
              />
            ) : null}
          </div>

          <p className="mt-3 text-caption leading-5 text-text-secondary/70">
            저장하면 AI가 자료를 분석해 새 지식 카드와 연관 카드를 찾아줍니다.
          </p>

          {authNotice ? (
            <div className="mt-4 rounded-leaf border border-primary-signal/20 bg-background/70 p-4">
              <p className="text-caption text-text-secondary">{authNotice}</p>

              {onLogin ? (
                <CurvedButton onClick={onLogin} fullWidth size="md" className="mt-3">
                  로그인하고 저장
                </CurvedButton>
              ) : null}
            </div>
          ) : null}

          {canSave ? (
            <CurvedButton
              onClick={onSave}
              disabled={isSaving}
              fullWidth
              size="md"
              className="mt-4"
            >
              {isSaving ? savingLabel : saveLabel}
            </CurvedButton>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
