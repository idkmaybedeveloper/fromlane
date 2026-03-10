lane-api
================

fromlane (aka lane-api) - неофициальный ts клиент для Lane API (музыкальный стриминг).

на данный момент реализовано:
- искать треки, артистов, альбомы
- получать stream url для трека
- скачивать треки
- получать текст песен (lyrics)
- информация об артистах

апи ручки получены путём реверс-инжиниринга официального android клиента com.skiy.lane

настройка
=========

создайте файл `.env` в корне проекта:
```bash
cp .env.example .env
```

добавьте токен авторизации:
```
LANE_TOKEN=your_firebase_id_token
```

как получить токен?
-------------------

1. установите frida и mitmproxy
2. перехватите запрос к `/createUserOrLogin?idToken=...`
3. idToken - это firebase token, используйте его в LANE_TOKEN

для байпасса ссл пининга:
```bash
frida --codeshare Q0120S/bypass-ssl-pinning -U -f com.skiy.lane
```

использование
=============

cli команды
-----------

поиск:
```bash
pnpm search "кино группа крови"
```

скачать трек:
```bash
pnpm download "кино группа крови"
pnpm download TRACK_ID_HERE
```

получить stream url:
```bash
pnpm stream "кино" high
pnpm stream TRACK_ID lossless
```

информация о треке:
```bash
pnpm info "кино"
pnpm info TRACK_ID --lyrics
```

информация об артисте:
```bash
pnpm artist "кино"
```

качества стриминга: `low`, `medium`, `high`, `lossless`

использование в качестве библиотеки
-----------------------------------

```typescript
import {
  search,
  getTrackStream,
  getTrackLyrics,
  getArtist,
  setAuthToken
} from "./api";

// установить токен
setAuthToken("your_firebase_token");

// поиск
const results = await search("кино");
console.log(results.tracks);

// получить stream url
const stream = await getTrackStream(trackId, { quality: "high" });
console.log(stream.url);

// получить lyrics
const lyrics = await getTrackLyrics(trackId);
console.log(lyrics.lyrics);
```

разработка
==========

установка зависимостей:
```bash
pnpm install
```

сборка:
```bash
pnpm build
```

реверсинг клиента: декомпилируйте APK через jadx и изучите retrofit интерфейсы
в `com.skiy.lane.data.remote.api.*`

в какие ручки ходит оригинальный клиент?
========================================

base url: `https://api.sklane.com`

| Метод  | Эндпоинт                                         | Описание         |
|--------|--------------------------------------------------|------------------|
| GET    | `/platforms/search?q=...&platform=android&ver=2` | поиск            |
| GET    | `/platforms/v2/hints?q=...`                      | автодополнение   |
| GET    | `/track/stream?trackId=...&streamQuality=...`    | stream url       |
| GET    | `/track/download?trackId=...`                    | download stream  |
| GET    | `/track/{id}/lyrics`                             | текст песни      |
| GET    | `/track/stats?trackId=...`                       | статистика трека |
| GET    | `/platforms/artist?artistId=...`                 | инфо об артисте  |
| GET    | `/platforms/album?albumId=...`                   | инфо об альбоме  |
| GET    | `/createUserOrLogin?idToken=...`                 | авторизация      |

полный список ручек смотрите в декомпилированных интерфейсах:
- `UserApi.java` - пользователи, плейлисты, подписки
- `TracksApi.java` - треки, стриминг, поиск
- `PlatformsApi.java` - артисты, альбомы
- `CommentsApi.java` - комментарии

дисклеймер
==========

это **!неофициальный!** клиент. апи оригинального клиента может измениться в любой момент.
используйте на свой страх и риск :3
