import type { DragEvent } from 'react';
import { useState } from 'react';
import { CurvedButton } from '../../../../ui/src/components/Button/CurvedButton';
import { UploadCloud, Edit3, Sparkles } from 'lucide-react';
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
  saveLabel = '저장하기',
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
      setError('10자 이상 드롭해주세요.');
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
        'relative w-full overflow-hidden rounded-leaf border-2 border-dashed px-popover-padding py-popover-padding transition-all duration-300 bg-surface-container',
        isOver
          ? 'border-primary-signal bg-primary-signal/10 shadow-neon glow-neon'
          : 'border-primary-signal/30',
      ].join(' ')}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <UploadCloud size={28} className="text-primary-signal" aria-hidden="true" />

          <p className="text-body-main-bold text-text-primary text-center">
            {isOver ? '여기에 놓아서 저장 준비' : '여기로 드래그하여 지식 심기'}
          </p>

          <p className="text-caption text-text-secondary text-center">
            Drag text, image or link to archive
          </p>
        </div>

        <div className="flex min-h-[100px] w-full items-start gap-3 rounded-leaf bg-surface-highest border border-primary-signal/20 p-4 text-left">
          <Edit3 size={20} className="text-primary-signal" aria-hidden="true" />
          <p className="text-body-main text-text-secondary leading-6">
            텍스트를 직접 입력하거나 붙여넣으세요
          </p>
        </div>
      </div>

      {error || saveError ? (
        <p className="mt-4 rounded-leaf border border-red-500/20 bg-red-500/10 px-popover-padding py-3 text-caption text-red-300">
          {error ?? saveError}
        </p>
      ) : null}

      {saveNotice ? (
        <div className="mt-4 rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-popover-padding py-3 text-caption text-primary-signal">
          {saveNotice}
        </div>
      ) : null}

      {pendingScrap ? (
        <div className="mt-5 rounded-leaf border border-primary-signal/20 bg-surface-container p-popover-padding shadow-neon">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary-signal" aria-hidden="true" />
              <span className="text-caption font-bold uppercase tracking-wide text-text-secondary">
                미리보기
              </span>
            </div>

            <CurvedButton
              onClick={onClear}
              tone="subtle"
              size="sm"
              className="mt-0"
              aria-label="Clear source"
            >
              CLEAR
            </CurvedButton>
          </div>

          <div className="max-h-[220px] overflow-y-auto rounded-leaf border border-primary-signal/10 bg-background/20 p-popover-padding">
            <p className="whitespace-pre-wrap text-body-main text-text-secondary">
              “{previewContent}”
            </p>

            {pendingScrap.image_preview_url ? (
              <img
                src={pendingScrap.image_preview_url}
                alt={pendingScrap.title}
                className="mt-4 max-h-40 w-full rounded-leaf object-cover"
              />
            ) : null}
          </div>

          <p className="mt-3 text-caption text-text-secondary/70 leading-5">
            저장하면 AI가 원문을 지식카드로 변환하고 관련 카드를 찾아줘요.
          </p>

          {authNotice ? (
            <div className="mt-4 rounded-leaf border border-primary-signal/20 bg-background/70 p-popover-padding">
              <p className="text-caption text-text-secondary">{authNotice}</p>

              {onLogin ? (
                <CurvedButton
                  onClick={onLogin}
                  fullWidth
                  size="md"
                  className="mt-3"
                >
                  로그인하고 시작하기
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
              className="mt-5"
            >
              {isSaving ? savingLabel : saveLabel}
            </CurvedButton>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

