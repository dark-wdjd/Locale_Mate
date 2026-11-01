# Guide page English titles — draft for review

_Drafted 2026-10-31. Nothing changed on the site yet._

**Format:** `<English name> – <role> in Chengdu (<specialty>)` + ` | MeetChengdu`. Aim ≤ ~65 characters total so Google shows the full title.
Only claims backed by each guide's public profile (e.g. "Senior" only where the profile says 高级, "Docent" only where it says 讲解员/bilingual docent).
The Chinese account name stays visible on the page (for checking on Xiaohongshu); only the page title and main heading become English-first.

| # | slug | Current title (on Google) | English name (H1) | Proposed page title | Length |
|---|---|---|---|---|---|
| 1 | `huage-harry` | Huage Harry | Harry | Harry – English Guide in Chengdu (Pandas & Opera) | 63 |
| 2 | `april` | 成都英语导游April | April | April – English Guide in Chengdu (Dujiangyan) | 59 ⚠️ |
| 3 | `yanny` | 四川中级英文导游yanny | Yanny | Yanny – English Tour Guide in Chengdu (Sanxingdui) | 64 |
| 4 | `penny` | 成都英语导游Penny | Penny | Penny – Senior English Guide in Chengdu (Pandas) | 62 |
| 5 | `susan` | 成都英语导游Susan | Susan | Susan – 10-Year English Guide in Chengdu (Pandas) | 63 |
| 6 | `maya` | Maya Chengdu Tourguide | Maya | Maya – Private English Guide in Chengdu & Sichuan | 63 |
| 7 | `betty` | Betty | Betty | Betty – English Panda Base Docent & Guide in Chengdu | 66 |
| 8 | `xiao-o` | 熊猫基地双语讲解小O | Xiao O | Xiao O – English Panda Base Guide in Chengdu | 58 |
| 9 | `xiaoyu` | 小鱼🐟带外国人看中国的日常 | Xiaoyu | Xiaoyu – English Tour Guide in Chengdu & Sichuan | 62 |
| 10 | `mala-big-bro` | 麻辣大师兄 | Mala Big Bro | Mala Big Bro – Chengdu Food & Culture Experiences | 63 |
| 11 | `kacha-kacha` | 咔嚓咔嚓 | Kacha Kacha | Kacha Kacha – English Guide & Photographer, Chengdu | 65 |
| 12 | `tina` | 跟Tina一起快乐出发 | Tina | Tina – English Guide in Chengdu (Western Sichuan) | 63 |
| 13 | `nick` | 都江堰导游尼克Nick | Nick | Nick – English Guide for Dujiangyan | 49 |
| 14 | `lin` | 英语导游🐼Lin | Lin | Lin – English Guide in Chengdu & Jiuzhaigou | 57 |
| 15 | `lynne` | WonderfulLynne | Lynne | Lynne – Private English Tour Guide in Chengdu | 59 |
| 16 | `holly` | Holly the guide | Holly | Holly – English Guide in Chengdu, Leshan & Zigong | 63 |
| 17 | `tangchaoer` | 唐朝儿in Chengdu | Tangchaoer | Tangchaoer – English Guide & Blogger in Chengdu | 61 |
| 18 | `chengdu-susan` | 成都英文导游Susan | Susan (Leshan) | Susan – English Guide in Chengdu (Du Fu & Leshan) | 63 |
| 19 | `tommy` | Tommy Chengdu 成都英语导游 | Tommy | Tommy – English Guide in Chengdu (Pandas) | 55 ⚠️ |
| 20 | `fiona` | 成都英语导游Fiona | Fiona | Fiona – English Panda Base Guide in Chengdu | 57 |
| 21 | `charles` | 成都英语导游Charles | Charles | Charles – English Guide for Jiuzhaigou & Sichuan | 62 |
| 22 | `hanfu-english-guide` | 爱穿汉服的成都英语导游 | The Hanfu Guide | Hanfu-Wearing English Tour Guide in Chengdu | 57 |
| 23 | `lucky` | Tour guide Lucky | Lucky | Lucky – English Guide in Chengdu & Chongqing | 58 |
| 24 | `libby` | 英语导游Libby | Libby | Libby – English Guide in Chengdu (Pandas & Cooking) | 65 |
| 25 | `melody` | Melody 🎃 | Melody | Melody – English Guide in Chengdu (Pandas) | 56 |
| 26 | `shanyu` | Shanyu | Shanyu | Shanyu – English Guide in Chengdu (Jinli & Wenshu) | 64 |
| 27 | `shirley` | Shirley英语 | Shirley (Families) | Shirley – English Guide in Chengdu for Families | 61 |
| 28 | `chengdu-shirley` | 成都英语导游Shirley | Shirley (Pandas) | Shirley – English Guide in Chengdu (Wuhou Shrine) | 63 |
| 29 | `laura` | 成都英语导游Laura | Laura | Laura – English Guide in Chengdu (Jiuzhaigou) | 59 |
| 30 | `jenny` | 成都英语导游镜子Jenny | Jenny | Jenny – English Sanxingdui Guide from Chengdu | 59 |
| 31 | `rebirth-chengdu-guide` | 重生之我在成都当英语导游 | Sanxingdui Guide | English Sanxingdui & Du Fu Guide in Chengdu | 57 |

## Notes for review

- **Two Susans:** `susan` = 10-year veteran (pandas, teahouses, Alan Walker team visit); `chengdu-susan` = Du Fu Cottage / Leshan / teahouse-concert posts. Specialties in the title tell them apart.
- **Two Shirleys:** `shirley` (Shirley英语, kids' outdoor organizer, many international groups) vs `chengdu-shirley` (English posts on pandas, Wuhou Shrine, Three Kingdoms).
- **No personal name on profile:** `hanfu-english-guide` and `rebirth-chengdu-guide` never state a name publicly, so the title uses a descriptive label instead of guessing one.
- **Mala Big Bro** runs a food/culture experience business rather than classic guiding, so the title says "Food & Culture Experiences".
- **Harry:** displayName is "Huage Harry"; title uses "Harry" — say if you prefer "Huage Harry".

## How it will be implemented (after approval)
- Add an optional English-name field and an SEO-title field to each guide (small database change), filled from this table.
- Page `<title>` and the main heading use the English name; the Xiaohongshu account name is shown under it.
- Re-seed production, then request indexing for the most important guide pages.
