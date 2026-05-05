import type { DragEvent } from 'react';
import { useState } from 'react';
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
  saveLabel = '저장하기 (Save)',
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
        'relative w-full overflow-hidden rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px]',
        'bg-[#181c1f] border-2 border-dashed px-4 py-9 transition-all duration-300',
        isOver
          ? 'border-[#00ffc2] bg-[#00ffc2]/10 shadow-[0_0_28px_rgba(0,255,194,0.2)]'
          : 'border-[#00ffc2]/30',
      ].join(' ')}
    >
      <div className="flex flex-col items-center gap-9">
        <div className="flex flex-col items-center">
          <CloudUploadIcon />

          <p className="mt-3 text-center text-sm font-medium text-[#e0e3e7]">
            {isOver ? '여기에 놓아서 저장 준비' : '여기로 드래그하여 지식 심기'}
          </p>

          <p className="mt-2 text-center text-[10px] text-[#b9cbc1]">
            Drag text, image or link to archive
          </p>
        </div>

        <div className="flex min-h-[100px] w-full items-start gap-3 rounded-lg border-2 border-[#00ffc2]/20 bg-[#181c1f] p-4 text-left">
          <EditIcon />
          <p className="text-sm font-medium leading-6 text-[#b9cbc1]">
            텍스트를 직접 입력하거나 붙여넣으세요
          </p>
        </div>
      </div>

      {error || saveError ? (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error ?? saveError}
        </p>
      ) : null}

      {saveNotice ? (
        <div className="mt-4 rounded-lg border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-3 py-2 text-xs text-[#00ffc2]">
          {saveNotice}
        </div>
      ) : null}

      {pendingScrap ? (
        <div className="mt-5 rounded-[24px] border border-[#3a4a43]/30 bg-[#1c2023] p-5 text-left shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SparkIcon />
              <span className="text-xs font-bold uppercase tracking-wide text-[#b9cbc1]">
                RAW ENTRY CAPTURED
              </span>
            </div>

            <CurvedButton
              onClick={onClear}
              tone="subtle"
              size="sm"
              className="px-3 py-1 text-[10px]"
              aria-label="Clear source"
            >
              CLEAR
            </CurvedButton>
          </div>

          <div className="max-h-[220px] overflow-y-auto rounded-[32px] border border-[#3a4a43]/10 bg-[#0b0f12]/50 p-5">
            <p className="whitespace-pre-wrap text-sm font-light leading-6 text-[#e0e3e7]/80">
              “{previewContent}”
            </p>

            {pendingScrap.image_preview_url ? (
              <img
                src={pendingScrap.image_preview_url}
                alt={pendingScrap.title}
                className="mt-4 max-h-40 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>

          <p className="mt-3 text-xs leading-5 text-[#b9cbc1]/70">
            저장하면 AI가 원문을 지식카드로 변환하고 관련 카드를 찾아줘요.
          </p>

          {authNotice ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#101417]/70 p-3">
              <p className="text-xs leading-5 text-[#b9cbc1]">{authNotice}</p>

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
              size="lg"
              className="mt-5"
              leadingIcon={<DatabaseIcon />}
            >
              {isSaving ? savingLabel : saveLabel}
            </CurvedButton>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

function CloudUploadIcon() {
  return (
    <svg width="33" height="24" viewBox="0 0 33 24" fill="none">
      <path
        d="M8.25 24C5.975 24 4.03125 23.2125 2.41875 21.6375C0.80625 20.0625 0 18.1375 0 15.8625C0 13.9125 0.5875 12.175 1.7625 10.65C2.9375 9.125 4.475 8.15 6.375 7.725C7 5.425 8.25 3.5625 10.125 2.1375C12 0.7125 14.125 0 16.5 0C19.425 0 21.9062 1.01875 23.9438 3.05625C25.9813 5.09375 27 7.575 27 10.5C28.725 10.7 30.1562 11.4437 31.2938 12.7312C32.4313 14.0188 33 15.525 33 17.25C33 19.125 32.3438 20.7188 31.0312 22.0312C29.7188 23.3438 28.125 24 26.25 24H18C17.175 24 16.4688 23.7062 15.8813 23.1187C15.2938 22.5312 15 21.825 15 21V13.275L12.6 15.6L10.5 13.5L16.5 7.5L22.5 13.5L20.4 15.6L18 13.275V21H26.25C27.3 21 28.1875 20.6375 28.9125 19.9125C29.6375 19.1875 30 18.3 30 17.25C30 16.2 29.6375 15.3125 28.9125 14.5875C28.1875 13.8625 27.3 13.5 26.25 13.5H24V10.5C24 8.425 23.2687 6.65625 21.8062 5.19375C20.3438 3.73125 18.575 3 16.5 3C14.425 3 12.6562 3.73125 11.1938 5.19375C9.73125 6.65625 9 8.425 9 10.5H8.25C6.8 10.5 5.5625 11.0125 4.5375 12.0375C3.5125 13.0625 3 14.3 3 15.75C3 17.2 3.5125 18.4375 4.5375 19.4625C5.5625 20.4875 6.8 21 8.25 21H12V24H8.25Z"
        fill="#00FFC2"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="11" height="10" viewBox="0 0 11 10" fill="none" className="mt-1 shrink-0">
      <path
        d="M0 5.83333V4.66667H4.08333V5.83333H0ZM0 3.5V2.33333H6.41667V3.5H0ZM0 1.16667V0H6.41667V1.16667H0ZM5.25 9.33333V7.53958L8.47292 4.33125C8.56042 4.24375 8.65764 4.18056 8.76458 4.14167C8.87153 4.10278 8.97847 4.08333 9.08542 4.08333C9.20208 4.08333 9.31389 4.10521 9.42083 4.14896C9.52778 4.19271 9.625 4.25833 9.7125 4.34583L10.2521 4.88542C10.3299 4.97292 10.3906 5.07014 10.4344 5.17708C10.4781 5.28403 10.5 5.39097 10.5 5.49792C10.5 5.60486 10.4806 5.71424 10.4417 5.82604C10.4028 5.93785 10.3396 6.0375 10.2521 6.125L7.04375 9.33333H5.25Z"
        fill="#00FFC2"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M0 12V10H6V12H0ZM6.75 8.15L4.65 6.05L6.05 4.65L8.15 6.75L6.75 8.15ZM10 6V0H12V6H10ZM15.25 8.15L13.85 6.75L15.95 4.65L17.35 6.05L15.25 8.15ZM16 12V10H22V12H16ZM11 14C10.1667 14 9.45833 13.7083 8.875 13.125C8.29167 12.5417 8 11.8333 8 11C8 10.1667 8.29167 9.45833 8.875 8.875C9.45833 8.29167 10.1667 8 11 8C11.8333 8 12.5417 8.29167 13.125 8.875C13.7083 9.45833 14 10.1667 14 11C14 11.8333 13.7083 12.5417 13.125 13.125C12.5417 13.7083 11.8333 14 11 14ZM15.95 17.35L13.85 15.25L15.25 13.85L17.35 15.95L15.95 17.35ZM6.05 17.35L4.65 15.95L6.75 13.85L8.15 15.25L6.05 17.35ZM10 22V16H12V22H10Z"
        fill="#00FFC2"
      />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 18C6.48333 18 4.35417 17.6125 2.6125 16.8375C0.870833 16.0625 0 15.1167 0 14V4C0 2.9 0.879167 1.95833 2.6375 1.175C4.39583 0.391667 6.51667 0 9 0C11.4833 0 13.6042 0.391667 15.3625 1.175C17.1208 1.95833 18 2.9 18 4V14C18 15.1167 17.1292 16.0625 15.3875 16.8375C13.6458 17.6125 11.5167 18 9 18Z"
        fill="#007255"
      />
    </svg>
  );
}