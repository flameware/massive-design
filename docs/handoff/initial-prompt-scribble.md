개인 프로젝트에 사용할 목적의 디자인 시스템을 token부터 component 레벨까지 Figma에 구축하고, 이를 이용해서 실제 코드화된 Storybook까지 만들고 싶어. 디자인 시스템을 구축하는 작업이 너무 방대하다면 Storybook은 별도 프로젝트/맵으로 작업을 옮기는것도 좋아. (Figma 파일은 여기를 사용하고자 해. 새로 만든 파일이라 비어있어. https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design?node-id=0-1&t=43gdDiscybrJ1RgA-1)

이 프로젝트와 관련해서 생각해 왔던 몇 가지 사항들을 아래에 적어볼께. 무리한 요구사항이거나, 작업비용대비 효율/효용이 낮은지 등은 같이 고민해줘.
- 작업 과정에서 Best Practice들을 조사하고 참고해서, 잘 만들어진 디자인 시스템은 어떻게 구성되어있는지 먼저 정리하고, 그걸 바탕으로 우리는 어떤 구조로 어떻게 만드는게 최선일지 같이 정리해나가고 싶어.
- 기본적으로 토큰/Variable로는 color, typography, spacing, round, shadow 등이 포함되면 좋겠어.
- Font Family는 Pretendard를 기본으로 했으면 좋겠어.
- Color는 몇 가지 핵심 컬러를 바탕으로 https://hihayk.github.io/scale 등의 툴을 이용해서 해당 컬러 family의 variation을 만들면 좋겠어
- (nice to have)이후에 키 컬러만 조정해도, 자동으로 관련된 color들이 변경되는 구조면 더 좋겠어.

아래 링크는 claude에게 이 작업을 하기 위해서 먼저 논의했던 대화 링크야.
https://claude.ai/share/88022c9c-13e5-4600-b825-8f62b03ef7b5
한 가지 짚고 싶은건, 이 대화에서 내가 대답한 답변도 어디까지나 참고사항으로만 다뤄주고, 확정사항은 아니니 애매하면 다시 질문해줘.

위 대화의 중간결과로 나온 프롬프트 문서는 여기에 있어. @docs/design-system-prompts.md
