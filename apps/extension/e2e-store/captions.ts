/**
 * The translated copy of one locale's five store slides. `claims` are the four
 * slide-5 rows in the order account, upload, tracking, source.
 */
export type StoreCaptions = {
  export: { headline: string; subtitle: string }
  import: { headline: string; subtitle: string }
  autoExport: { headline: string; subtitle: string }
  popup: { headline: string; subtitle: string }
  local: {
    headline: string
    claims: [string, string, string, string]
  }
}

/**
 * Slide copy per locale folder name (`locales/<code>.json`). Subtitles list
 * the six export formats and the hourly-to-weekly schedules.
 */
export const STORE_CAPTIONS: Record<string, StoreCaptions> = {
  en: {
    export: {
      headline: 'Export exactly what you choose',
      subtitle:
        'One folder or everything — as HTML, JSON, CSV, Markdown, OPML or XBEL.',
    },
    import: {
      headline: 'Preview every import first',
      subtitle: 'Then merge, replace, or drop it into a new folder.',
    },
    autoExport: {
      headline: 'Scheduled backups, hands-free',
      subtitle: 'Hourly to weekly, to Downloads or a folder you choose.',
    },
    popup: {
      headline: 'Export or import from the toolbar',
      subtitle: 'One-click export, or drop files to import.',
    },
    local: {
      headline: 'Everything stays on your device',
      claims: [
        'No account needed',
        'Nothing is uploaded — no cloud, no server',
        'No analytics or tracking',
        'Open source on GitHub',
      ],
    },
  },
  es: {
    export: {
      headline: 'Exporta exactamente lo que elijas',
      subtitle:
        'Una carpeta o todo, en HTML, JSON, CSV, Markdown, OPML o XBEL.',
    },
    import: {
      headline: 'Previsualiza cada importación',
      subtitle: 'Luego fusiona, reemplaza o guárdala en una carpeta nueva.',
    },
    autoExport: {
      headline: 'Copias programadas, sin esfuerzo',
      subtitle:
        'De cada hora a semanal, a Descargas o a una carpeta que elijas.',
    },
    popup: {
      headline: 'Exporta o importa desde la barra',
      subtitle: 'Exporta con un clic o suelta archivos para importar.',
    },
    local: {
      headline: 'Todo se queda en tu dispositivo',
      claims: [
        'No necesitas cuenta',
        'No se sube nada: sin nube ni servidor',
        'Sin analíticas ni rastreo',
        'Código abierto en GitHub',
      ],
    },
  },
  de: {
    export: {
      headline: 'Exportiere genau, was du willst',
      subtitle:
        'Ein Ordner oder alles – als HTML, JSON, CSV, Markdown, OPML oder XBEL.',
    },
    import: {
      headline: 'Jeden Import erst ansehen',
      subtitle:
        'Dann zusammenführen, ersetzen oder in einen neuen Ordner legen.',
    },
    autoExport: {
      headline: 'Sicherungen nach Zeitplan',
      subtitle:
        'Von stündlich bis wöchentlich, in Downloads oder einen Ordner deiner Wahl.',
    },
    popup: {
      headline: 'Export und Import per Symbolleiste',
      subtitle:
        'Mit einem Klick exportieren oder Dateien zum Importieren ablegen.',
    },
    local: {
      headline: 'Alles bleibt auf deinem Gerät',
      claims: [
        'Kein Konto nötig',
        'Nichts wird hochgeladen – keine Cloud, kein Server',
        'Keine Analyse, kein Tracking',
        'Open Source auf GitHub',
      ],
    },
  },
  fr: {
    export: {
      headline: 'Exportez ce que vous choisissez',
      subtitle:
        'Un dossier ou tout, en HTML, JSON, CSV, Markdown, OPML ou XBEL.',
    },
    import: {
      headline: 'Prévisualisez chaque import',
      subtitle:
        'Puis fusionnez, remplacez ou placez-le dans un nouveau dossier.',
    },
    autoExport: {
      headline: 'Sauvegardes planifiées',
      subtitle:
        'Chaque heure ou chaque semaine, dans Téléchargements ou un dossier de votre choix.',
    },
    popup: {
      headline: 'Exporter ou importer depuis la barre',
      subtitle: 'Export en un clic, ou déposez des fichiers pour importer.',
    },
    local: {
      headline: 'Tout reste sur votre appareil',
      claims: [
        'Aucun compte requis',
        "Rien n'est envoyé : ni cloud, ni serveur",
        'Aucune analyse, aucun suivi',
        'Open source sur GitHub',
      ],
    },
  },
  it: {
    export: {
      headline: 'Esporta solo ciò che scegli',
      subtitle:
        'Una cartella o tutto, in HTML, JSON, CSV, Markdown, OPML o XBEL.',
    },
    import: {
      headline: 'Anteprima di ogni importazione',
      subtitle: 'Poi unisci, sostituisci o inserisci in una nuova cartella.',
    },
    autoExport: {
      headline: 'Backup programmati',
      subtitle:
        'Da ogni ora a ogni settimana, in Download o in una cartella a scelta.',
    },
    popup: {
      headline: 'Esporta o importa dalla barra',
      subtitle: 'Esporta con un clic o trascina i file per importare.',
    },
    local: {
      headline: 'Tutto resta sul tuo dispositivo',
      claims: [
        'Nessun account richiesto',
        'Nulla viene caricato: niente cloud, niente server',
        'Nessuna analisi né tracciamento',
        'Open source su GitHub',
      ],
    },
  },
  ja: {
    export: {
      headline: '選んだものだけを書き出し',
      subtitle:
        '1つのフォルダもすべても、HTML・JSON・CSV・Markdown・OPML・XBELで。',
    },
    import: {
      headline: '読み込む前に必ずプレビュー',
      subtitle: 'そのあと、統合・置き換え・新しいフォルダへの追加を選べます。',
    },
    autoExport: {
      headline: 'スケジュールで自動バックアップ',
      subtitle:
        '毎時から毎週まで、ダウンロードフォルダか選んだフォルダへ保存します。',
    },
    popup: {
      headline: 'ツールバーから書き出しも読み込みも',
      subtitle: 'ワンクリックで書き出し。ファイルをドロップして読み込み。',
    },
    local: {
      headline: 'すべてお使いの端末の中に',
      claims: [
        'アカウント不要',
        'アップロードなし。クラウドもサーバーも不要',
        '分析もトラッキングもなし',
        'GitHubで公開中のオープンソース',
      ],
    },
  },
  ko: {
    export: {
      headline: '원하는 것만 정확히 내보내기',
      subtitle: '폴더 하나든 전체든 HTML, JSON, CSV, Markdown, OPML, XBEL로.',
    },
    import: {
      headline: '가져오기 전에 항상 미리 보기',
      subtitle: '그다음 병합, 교체, 새 폴더에 담기 중에서 골라요.',
    },
    autoExport: {
      headline: '일정에 따른 자동 백업',
      subtitle:
        '매시간부터 매주까지, 다운로드 폴더나 직접 고른 폴더에 저장돼요.',
    },
    popup: {
      headline: '툴바에서 내보내기와 가져오기',
      subtitle: '클릭 한 번으로 내보내고, 파일을 놓아 가져와요.',
    },
    local: {
      headline: '모든 것은 내 기기 안에서',
      claims: [
        '계정이 필요 없어요',
        '업로드 없음: 클라우드도 서버도 없어요',
        '분석도 추적도 없어요',
        'GitHub의 오픈 소스',
      ],
    },
  },
  pt_BR: {
    export: {
      headline: 'Exporte só o que você escolher',
      subtitle:
        'Uma pasta ou tudo, em HTML, JSON, CSV, Markdown, OPML ou XBEL.',
    },
    import: {
      headline: 'Veja cada importação antes',
      subtitle: 'Depois mescle, substitua ou coloque em uma nova pasta.',
    },
    autoExport: {
      headline: 'Backups agendados e automáticos',
      subtitle:
        'De hora em hora a semanalmente, em Downloads ou em uma pasta à sua escolha.',
    },
    popup: {
      headline: 'Exporte ou importe pela barra',
      subtitle: 'Exporte com um clique ou solte arquivos para importar.',
    },
    local: {
      headline: 'Tudo fica no seu dispositivo',
      claims: [
        'Sem necessidade de conta',
        'Nada é enviado: sem nuvem, sem servidor',
        'Sem análises nem rastreamento',
        'Código aberto no GitHub',
      ],
    },
  },
  ru: {
    export: {
      headline: 'Экспорт ровно того, что нужно',
      subtitle:
        'Одна папка или всё сразу — в HTML, JSON, CSV, Markdown, OPML или XBEL.',
    },
    import: {
      headline: 'Предпросмотр каждого импорта',
      subtitle: 'Затем объедините, замените или добавьте в новую папку.',
    },
    autoExport: {
      headline: 'Копии по расписанию',
      subtitle:
        'От ежечасных до еженедельных, в «Загрузки» или в выбранную папку.',
    },
    popup: {
      headline: 'Экспорт и импорт с панели',
      subtitle: 'Экспорт в один клик, импорт — перетаскиванием файлов.',
    },
    local: {
      headline: 'Всё остаётся на вашем устройстве',
      claims: [
        'Аккаунт не нужен',
        'Ничего не загружается: ни облака, ни сервера',
        'Без аналитики и слежки',
        'Открытый код на GitHub',
      ],
    },
  },
  zh_CN: {
    export: {
      headline: '只导出你选择的内容',
      subtitle:
        '一个文件夹或全部书签，支持 HTML、JSON、CSV、Markdown、OPML 或 XBEL。',
    },
    import: {
      headline: '导入前先预览',
      subtitle: '然后选择合并、替换，或放入新文件夹。',
    },
    autoExport: {
      headline: '按计划自动备份',
      subtitle: '从每小时到每周，保存到下载文件夹或你选择的文件夹。',
    },
    popup: {
      headline: '在工具栏中导出或导入',
      subtitle: '一键导出，或拖入文件即可导入。',
    },
    local: {
      headline: '一切都留在你的设备上',
      claims: [
        '无需账号',
        '不上传任何内容：没有云端，没有服务器',
        '没有分析，没有跟踪',
        'GitHub 上的开源项目',
      ],
    },
  },
}
