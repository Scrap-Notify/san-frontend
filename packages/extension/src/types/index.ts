// 프론트엔드 익스텐션에서 사용할 타입들을 정의하는 파일입니다.
// 백엔드와 공유하는 타입(scrap한 내용이 db에 저장되어야 하므로) 과 익스텐션 UI에서만 필요한 타입을 함께 관리합니다.
// 백엔드와 공유하는 타입은 @san/shared 패키지에서 가져와서 사용합니다.
import { SourceType } from '@san/shared'; // 백엔드 타입을 직접 가져와서 씁니다.

export interface PendingScrap {
  source_type: SourceType;   // ✅ 추가: LINK, TEXT 등 구분
  source_url: string;        // ✅ 변경: url -> source_url
  raw_content: string | null; // ✅ 변경: description -> raw_content
  image_url: string | null;   // ✅ 변경: image -> image_url
  // 아래는 익스텐션 UI 렌더링을 위해 유지해도 무방합니다.
  title: string;
  domain: string;
  favicon: string | null;
}

// 메시지 통신을 위한 타입 정의입니다.
export type MessageType = 
  | 'REQUEST_METADATA'    // Background -> Content: 메타데이터 요청
  | 'SCRAP_SELECTION'      // Content -> Background: 드래그 텍스트 전송
  | 'PUSH_TO_SIDEPANEL'    // Background -> Sidepanel: 데이터 최종 전달

export interface ExtensionMessage {
  type: MessageType;
  payload?: any; // 구체적인 타입은 상황에 따라 정의 (예: PendingScrap)
}