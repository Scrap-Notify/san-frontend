import type { DragEvent, MouseEvent } from 'react';
import { useState } from 'react';
import { CloudUpload, RotateCcw, Sparkles } from 'lucide-react';
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

const MIN_TEXT_LENGTH = 10;

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
  const [isEditing, setIsEditing] = useState(false);
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const captureText = async (text: string) => {
    const nextText = text.trim();

    if (nextText.length < MIN_TEXT_LENGTH) {
      setError('10자 이상의 텍스트나 링크를 입력해 주세요.');
      return;
    }

    await onTextDrop(nextText);
    setManualText('');
    setIsEditing(false);
  };

  const handleDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsOver(false);
    setError(null);

    const imageFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith('image/')
    );

    if (imageFile) {
      await onImageDrop(imageFile);
      setIsEditing(false);
      return;
    }

    const droppedText = event.dataTransfer.getData('text/plain');
    await captureText(droppedText);
  };

  const handleManualSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setError(null);
    await captureText(manualText);
  };

  const handleCancelEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setManualText('');
    setError(null);
    setIsEditing(false);
  };

  const previewContent = pendingScrap?.raw_content ?? pendingScrap?.title ?? '';
  const isImageCapture = Boolean(pendingScrap?.image_preview_url);

  return (
    <>
      <section
        onClick={() => setIsEditing(true)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        className={[
          'relative flex h-[220px] w-full cursor-text items-center justify-center overflow-hidden rounded-leaf border-2 border-dashed bg-surface-container px-5 pb-4 pt-8 transition-all duration-300',
          isOver
            ? 'border-primary-signal bg-primary-signal/10 shadow-neon glow-neon'
            : 'border-primary-signal/30 hover:border-primary-signal/50 hover:bg-surface-container/80',
        ].join(' ')}
      >
        {isEditing ? (
          <div className="flex h-full w-full flex-col gap-3" onClick={(event) => event.stopPropagation()}>
            <textarea
              value={manualText}
              onChange={(event) => setManualText(event.target.value)}
              autoFocus
              placeholder="여기에 직접 입력하거나 텍스트, 이미지, 링크를 드래그하세요."
              className="min-h-0 w-full flex-1 resize-none bg-transparent text-body-sm leading-6 text-text-primary outline-none placeholder:text-text-secondary/45"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full px-3 py-1.5 text-body-sm-bold text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleManualSubmit}
                className="rounded-full border border-primary-signal/35 bg-primary-signal/10 px-4 py-1.5 text-body-sm-bold text-primary-signal transition hover:border-primary-signal/70 hover:bg-primary-signal/15 active:translate-y-px"
              >
                완료
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <CloudUpload size={34} className="text-primary-signal" aria-hidden="true" />
            <p className="text-body-main font-medium text-text-primary">
              {isOver ? '여기에 놓아 지식 심기' : '여기로 드래그하여 지식 심기'}
            </p>
            <p className="text-caption text-text-secondary">
              Drag text, image or link to archive
            </p>
          </div>
        )}
      </section>

      {error || saveError ? (
        <p className="rounded-leaf border border-red-500/20 bg-red-500/10 px-4 py-3 text-caption text-red-300">
          {error ?? saveError}
        </p>
      ) : null}

      {saveNotice ? (
        <div className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-4 py-3 text-caption text-primary-signal">
          {saveNotice}
        </div>
      ) : null}

      {pendingScrap ? (
        <section className="rounded-leaf border border-primary-signal/20 bg-surface-container p-4 shadow-neon">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary-signal" aria-hidden="true" />
              <span className="text-caption-bold uppercase text-text-secondary">
                Captured Source
              </span>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-caption-bold uppercase text-primary-signal transition hover:text-text-primary active:translate-y-px"
              aria-label="Clear source"
              title="Clear source"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Clear
            </button>
          </div>

          <div className="max-h-[220px] overflow-y-auto rounded-leaf border border-primary-signal/10 bg-background/40 p-4">
            {isImageCapture ? (
              <img
                src={pendingScrap.image_preview_url}
                alt={pendingScrap.title}
                className="max-h-44 w-full rounded-leaf object-cover"
              />
            ) : null}

            {previewContent ? (
              <p
                className={[
                  'whitespace-pre-wrap text-body-main text-text-secondary',
                  isImageCapture ? 'mt-4' : '',
                ].join(' ')}
              >
                {previewContent}
              </p>
            ) : null}
          </div>

          <p className="mt-3 text-caption leading-5 text-text-secondary/70">
            저장하면 AI가 자료를 분석하고 관련 지식 카드를 함께 찾아줍니다.
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
        </section>
      ) : null}
    </>
  );
};
