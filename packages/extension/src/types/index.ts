// 익스텐션 내부에서 통용되는 데이터 규격입니다.
export interface PendingScrap {
  title: string;
  url: string;
  domain: string;
  description: string | null;
  image: string | null;
  favicon: string | null;
}

// 메시지 통신을 위한 타입 정의입니다.
export type MessageType = 
  | 'REQUEST_METADATA'    // Background -> Content: 메타데이터 요청
  | 'SCRAP_SELECTION'      // Content -> Background: 드래그 텍스트 전송
  | 'PUSH_TO_SIDEPANEL'    // Background -> Sidepanel: 데이터 최종 전달
  | 'TEXT_SELECTED';       // 기존 Sidepanel 리스너에서 사용하던 타입 (동기화 필요)

export interface ExtensionMessage {
  type: MessageType;
  payload?: any; // 구체적인 타입은 상황에 따라 정의 (예: PendingScrap)
}