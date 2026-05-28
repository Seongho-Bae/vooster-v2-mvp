# 유비쿼터스 랭귀지

이 파일은 vspec이 use case 품질을 검토할 때 참고하는 도메인 용어집입니다.

## Preferred Terms

- `use case`: actor와 system의 상호작용을 goal 중심으로 기록한 계약.
- `actor`: scenario step에서 행동하는 주체.
- `stakeholder`: use case 결과에 이해관계를 가진 주체.
- `main success scenario`: 목표가 정상적으로 달성되는 대표 경로.
- `extension`: main success scenario에서 벗어나는 대안 또는 예외 경로.
- `success guarantee`: 성공 시 반드시 참이어야 하는 관찰 가능한 결과.
- `minimal guarantee`: 실패하더라도 보장되어야 하는 관찰 가능한 결과.

## Avoid Terms

- `처리한다`: 어떤 입력을 어떤 결과로 바꾸는지 구체적으로 작성한다.
- `관리한다`: 생성, 조회, 수정, 삭제, 승인, 반려 등 관찰 가능한 동작으로 나눈다.
- `지원한다`: 사용자가 무엇을 할 수 있게 되는지 구체적으로 작성한다.
- `적절히`: 판단 기준이나 완료 조건을 명시한다.
- `등`: 포함 범위를 닫힌 목록으로 작성한다.
- `관련`: 대상 도메인 객체나 규칙 이름을 직접 쓴다.
