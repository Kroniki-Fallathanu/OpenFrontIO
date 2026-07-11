import { ClientEnv } from "./ClientEnv";

/**
 * Polish dark-fantasy reskin of unit/structure names and build descriptions.
 * Highest precedence: overrides even pl.json so the fantasy renames win in
 * every locale. Gated by FANTASY_THEME.
 */
const FANTASY_TEXT_PL: Readonly<Record<string, string>> = {
  "main.title": "Dzikie Ziemie - Hexah",
  // Nacje to w Dzikich Ziemiach plemiona, a boty - bezimienni dzicy.
  "player_type.nation": "Plemię",
  "player_type.bot": "Dzicy",
  "unit_type.city": "Twierdza",
  "unit_type.port": "Przystań",
  "unit_type.factory": "Kuźnia",
  "unit_type.defense_post": "Strażnica",
  "unit_type.sam_launcher": "Wieża łucznicza",
  "unit_type.missile_silo": "Wieża maga",
  "unit_type.warship": "Galeon",
  "unit_type.atom_bomb": "Kula ognia",
  "unit_type.hydrogen_bomb": "Kataklizm",
  "unit_type.mirv": "Deszcz meteorów",
  "build_menu.desc.city": "Zwiększa liczbę poddanych",
  "build_menu.desc.port": "Wysyła kupieckie korabie po złoto",
  "build_menu.desc.factory": "Buduje szlaki i wysyła karawany",
  "build_menu.desc.defense_post": "Wzmacnia obronę pobliskich rubieży",
  "build_menu.desc.sam_launcher": "Odpiera nadlatujące zaklęcia",
  "build_menu.desc.missile_silo": "Stąd ciska się niszczycielskie zaklęcia",
  "build_menu.desc.warship": "Przejmuje korabie, topi łodzie i statki",
  "build_menu.desc.atom_bomb": "Niewielki wybuch ognia",
  "build_menu.desc.hydrogen_bomb": "Potężny kataklizm",
  "build_menu.desc.mirv": "Ogromny wybuch, dosięga tylko wybranego gracza",
};

/**
 * Returns the fantasy rename for a key when FANTASY_THEME is on (highest
 * precedence), otherwise undefined.
 */
export function fantasyTextOverride(key: string): string | undefined {
  if (!ClientEnv.fantasyTheme()) return undefined;
  return FANTASY_TEXT_PL[key];
}

/**
 * Polish translations for UI keys that the Crowdin-managed `pl.json` does not
 * yet cover (it is ~49% complete). Applied as an overlay ABOVE the English
 * fallback but BELOW pl.json, only when FANTASY_THEME (the Hexah deployment)
 * is on, so the whole interface reads Polish without modifying any Crowdin
 * translation file. ICU placeholders and markdown are preserved verbatim.
 *
 * Scope: player-visible gameplay UI. Auth/clan/store/cosmetics screens (hidden
 * in the embedded Hexah deployment) are intentionally not covered here.
 */
const PL_SUPPLEMENT: Readonly<Record<string, string>> = {
  "build_menu.warship_shift_hint":
    "Przytrzymaj Shift i przeciągnij, aby zaznaczyć wiele galeonów naraz",
  "chat.warnings.stop_trading_all": "Przestańcie handlować ze wszystkimi!",

  "common.back": "Wstecz",
  "common.click_to_copy": "Kliknij, aby skopiować",
  "common.confirm": "Potwierdź",
  "common.copied": "Skopiowano!",
  "common.copy": "Kopiuj",
  "common.disabled": "Wyłączone",
  "common.duration_hour_short": "godz.",
  "common.duration_minute_short": "min",
  "common.duration_second_short": "s",
  "common.enabled": "Włączone",
  "common.map_default": "Domyślne dla mapy",
  "common.month_apr": "Kwiecień",
  "common.month_aug": "Sierpień",
  "common.month_dec": "Grudzień",
  "common.month_feb": "Luty",
  "common.month_jan": "Styczeń",
  "common.month_jul": "Lipiec",
  "common.month_jun": "Czerwiec",
  "common.month_mar": "Marzec",
  "common.month_may": "Maj",
  "common.month_nov": "Listopad",
  "common.month_oct": "Październik",
  "common.month_sep": "Wrzesień",
  "common.not_logged_in": "Niezalogowany",
  "common.paste": "Wklej",

  "control_panel.allied_afk_neighbor_info":
    "Możesz atakować rozłączonych graczy, nawet jeśli jesteś z nimi w sojuszu.",
  "control_panel.army_limit_warning":
    "Zbliżasz się do limitu armii! Rozważ wysłanie wojsk sojusznikom.",
  "control_panel.low_troops_warning":
    "Masz bardzo mało wojsk – zawsze zostawiaj trochę na obronę.",
  "control_panel.teammate_afk_neighbor_info":
    "Możesz atakować rozłączonych członków drużyny.",
  "control_panel.traitor_neighbor_info":
    "Możesz zdradzić zdrajców, nie stając się przy tym zdrajcą.",

  "difficulty.easy": "Łatwy",
  "difficulty.hard": "Trudny",
  "difficulty.impossible": "Niemożliwy",
  "difficulty.medium": "Średni",

  "error_modal.spawn_failed.description":
    "Automatyczny wybór miejsca startu nie powiódł się. Nie możesz zagrać tej gry.",
  "error_modal.spawn_failed.title": "Start nieudany",

  "events_display.alliance_nukes_destroyed_incoming":
    "{count, plural, one {# zaklęcie rzucone przez {name} zostało zniszczone dzięki sojuszowi} few {# zaklęcia rzucone przez {name} zostały zniszczone dzięki sojuszowi} many {# zaklęć rzuconych przez {name} zostało zniszczonych dzięki sojuszowi} other {# zaklęć rzuconych przez {name} zostało zniszczonych dzięki sojuszowi}}",
  "events_display.alliance_nukes_destroyed_outgoing":
    "{count, plural, one {# zaklęcie wymierzone w {name} zostało zniszczone dzięki sojuszowi} few {# zaklęcia wymierzone w {name} zostały zniszczone dzięki sojuszowi} many {# zaklęć wymierzonych w {name} zostało zniszczonych dzięki sojuszowi} other {# zaklęć wymierzonych w {name} zostało zniszczonych dzięki sojuszowi}}",
  "events_display.alliance_request_sent": "Wysłano prośbę o sojusz do {name}.",
  "events_display.atom_bomb_detonated": "{name} – kula ognia eksplodowała",
  "events_display.attack_cancelled_retreat":
    "Atak przerwany, {troops} żołnierzy zginęło podczas odwrotu",
  "events_display.betrayal_debuff_ends":
    "{time} s do końca kary za zdradę",
  "events_display.conquered_no_gold":
    "Podbito {name} (nie grał, brak złota)",
  "events_display.hydrogen_bomb_detonated": "{name} – kataklizm eksplodował",
  "events_display.mirv_warheads_intercepted":
    "{count, plural, one {przechwycono {count} głowicę deszczu meteorów} few {przechwycono {count} głowice deszczu meteorów} many {przechwycono {count} głowic deszczu meteorów} other {przechwycono {count} głowic deszczu meteorów}}",
  "events_display.missile_intercepted": "Pocisk przechwycony {unit}",
  "events_display.no_boats_available": "Brak dostępnych łodzi, maks. {max}",
  "events_display.received_gold_from_captured_ship":
    "Otrzymano {gold} złota ze statku przejętego od {name}",
  "events_display.received_gold_from_conquest":
    "Podbito {name}, otrzymano {gold} złota",
  "events_display.received_gold_from_player":
    "Otrzymano {gold} złota od {name}",
  "events_display.received_troops_from_player":
    "Otrzymano {troops} wojsk od {name}",
  "events_display.sent_gold_to_player": "Wysłano {gold} złota do {name}",
  "events_display.sent_troops_to_player": "Wysłano {troops} wojsk do {name}",
  "events_display.unit_destroyed": "Twój {unit} został zniszczony",
  "events_display.wants_to_renew_alliance":
    "{name} chce odnowić sojusz z Tobą",

  "fullscreen.enter": "Pełny ekran",
  "fullscreen.exit": "Wyjdź z pełnego ekranu",

  "game_info_modal.all_gold": "Całe złoto",
  "game_info_modal.atoms": "Kule ognia",
  "game_info_modal.bombs": "Zaklęcia",
  "game_info_modal.conquered": "Podbito",
  "game_info_modal.conquest_gold": "Złoto z podbitych graczy",
  "game_info_modal.conquests": "Podboje",
  "game_info_modal.duration": "Czas trwania",
  "game_info_modal.economy": "Gospodarka",
  "game_info_modal.hydros": "Kataklizmy",
  "game_info_modal.loading_game_info": "Wczytywanie statystyk gry",
  "game_info_modal.mirv": "Deszcz meteorów",
  "game_info_modal.naval_trade": "Korab handlowy",
  "game_info_modal.no_winner":
    "Ta gra zakończyła się bez zwycięzcy (lub wygrał Naród)",
  "game_info_modal.num_of_conquests_bots": "Pokonane plemiona",
  "game_info_modal.num_of_conquests_humans": "Pokonani gracze",
  "game_info_modal.pirate": "Pirat",
  "game_info_modal.players": "Gracze",
  "game_info_modal.stolen_gold": "Zrabowane galeonami",
  "game_info_modal.survival_time": "Czas przetrwania",
  "game_info_modal.title": "Informacje o grze",
  "game_info_modal.total_gold": "Łącznie",
  "game_info_modal.trade": "Handel",
  "game_info_modal.train_trade": "Karawana",
  "game_info_modal.war": "Wojna",

  "game_list.ranking": "Ranking",
  "game_list.replay": "Powtórka",

  "graphics_setting.black": "Czarny",
  "graphics_setting.classic_icons_desc":
    "Jaśniejszy kontur z niemal czarnym wnętrzem",
  "graphics_setting.classic_icons_label": "Klasyczne ikony",
  "graphics_setting.colored": "Kolorowe",
  "graphics_setting.colored_names_desc":
    "Pokazuj nazwy graczy w ich kolorze lub na czarno",
  "graphics_setting.colored_names_label": "Kolor nazw",
  "graphics_setting.coordinate_grid_opacity_desc":
    "Jak nieprzezroczysta jest siatka współrzędnych (niżej = więcej widać pod spodem)",
  "graphics_setting.coordinate_grid_opacity_label":
    "Przezroczystość siatki współrzędnych",
  "graphics_setting.highlight_brighten_desc":
    "Jak mocno granica rozjaśnia się po najechaniu (0 wyłącza)",
  "graphics_setting.highlight_brighten_label": "Siła podświetlenia granicy",
  "graphics_setting.highlight_fill_desc":
    "Jak mocno terytorium rozjaśnia się po najechaniu (0 wyłącza)",
  "graphics_setting.highlight_fill_label": "Podświetlenie terytorium",
  "graphics_setting.highlight_thicken_desc":
    "Jak bardzo granica grubieje po najechaniu",
  "graphics_setting.highlight_thicken_label": "Grubość podświetlenia granicy",
  "graphics_setting.hover_fade_desc":
    "Jak widoczne są nazwy pod kursorem (1 wyłącza zanikanie)",
  "graphics_setting.hover_fade_label": "Przezroczystość nazwy pod kursorem",
  "graphics_setting.hover_glow_alpha_desc":
    "Jak jasna jest biała poświata za nazwą pod kursorem (0 wyłącza)",
  "graphics_setting.hover_glow_alpha_label": "Siła poświaty",
  "graphics_setting.hover_glow_width_desc":
    "Jak daleko sięga biała poświata za nazwą pod kursorem",
  "graphics_setting.hover_glow_width_label": "Rozmiar poświaty",
  "graphics_setting.name_cull_desc": "Ukryj nazwy mniejsze niż ten rozmiar",
  "graphics_setting.name_cull_label": "Minimalny rozmiar nazwy",
  "graphics_setting.name_scale_label": "Skala nazw",
  "graphics_setting.rail_distance_desc":
    "Jak daleko po oddaleniu widać tory karawan",
  "graphics_setting.rail_distance_label": "Zasięg rysowania torów",
  "graphics_setting.rail_thickness_desc": "Jak szeroko rysowane są tory",
  "graphics_setting.rail_thickness_label": "Grubość torów",
  "graphics_setting.reset_desc": "Wyczyść wszystkie zmiany grafiki",
  "graphics_setting.reset_label": "Przywróć domyślne",
  "graphics_setting.section_accessibility": "Dostępność",
  "graphics_setting.section_effects": "Efekty",
  "graphics_setting.section_map": "Mapa",
  "graphics_setting.section_name_labels": "Etykiety nazw",
  "graphics_setting.section_structure_icons": "Ikony budowli",
  "graphics_setting.territory_alpha_desc":
    "Jak nieprzezroczyste jest wypełnienie terytorium (niżej = więcej widać teren)",
  "graphics_setting.territory_alpha_label": "Przezroczystość terytorium",
  "graphics_setting.territory_sat_desc":
    "Jak żywe są kolory terytorium (niżej je wygasza)",
  "graphics_setting.territory_sat_label": "Nasycenie terytorium",
  "graphics_setting.title": "Ustawienia grafiki",

  "heads_up_message.catching_up": "Doganianie...",
  "heads_up_message.dont_show_again": "Nie pokazuj ponownie",
  "heads_up_message.ffa_collusion":
    "Przypomnienie: zmawianie się przed grą jest niedozwolone w trybie każdy na każdego",
  "heads_up_message.multiplayer_game_paused":
    "Gra wstrzymana przez założyciela lobby",
  "heads_up_message.pvp_immunity_active":
    "Ochrona PVP aktywna przez {seconds} s",
  "heads_up_message.random_spawn":
    "Losowy start włączony. Wybieranie miejsca startu...",
  "heads_up_message.singleplayer_game_paused": "Gra wstrzymana",

  "help_modal.action_coordinate_grid": "Przełącz siatkę współrzędnych",
  "help_modal.action_enter": "Buduje jednostkę pod kursorem",
  "help_modal.action_esc": "Zamyka menu. Anuluje podgląd budowy.",
  "help_modal.action_game_speed":
    "Zwolnij / przyspiesz grę (tryb jednoosobowy)",
  "help_modal.action_pause_game": "Wstrzymaj / wznów grę",
  "help_modal.action_warship_multiselect":
    "Zaznacz wiele galeonów (przeciągnij, by narysować ramkę)",
  "help_modal.action_warship_selectall": "Zaznacz wszystkie swoje galeony",
  "help_modal.bomb_direction": "Kierunek łuku kuli ognia / kataklizmu",
  "help_modal.drag": "przeciągnij",
  "help_modal.game_id_tooltip": "ID gry",
  "help_modal.icon_alt_player_leaderboard": "Ikona rankingu graczy",
  "help_modal.icon_alt_team_leaderboard": "Ikona rankingu drużyn",
  "help_modal.option_speed":
    "Prędkość – dostosuj tempo gry. Niedostępne w grach publicznych.",
  "help_modal.radial_donate_gold":
    "Otwiera suwak darowizny złota, by szybko przekazać złoto sojusznikom.",
  "help_modal.radial_donate_troops":
    "Przekaż wojsko (wg ustawienia suwaka ataku) sojusznikowi, na którym otwarto menu.",
  "help_modal.troubleshooting_desc":
    "Jeśli napotykasz problemy z wydajnością, zawieszenia lub inne kłopoty podczas gry, zajrzyj na stronę rozwiązywania problemów:",
  "help_modal.video_tutorial": "Samouczek wideo",
  "help_modal.video_tutorial_title": "Samouczek",

  "host_modal.assigned_teams": "Przydzielone drużyny",
  "host_modal.crowded": "Modyfikator zatłoczenia",
  "host_modal.disable_alliances": "Wyłącz sojusze",
  "host_modal.empty_team": "Pusta",
  "host_modal.empty_teams": "Puste drużyny",
  "host_modal.gold_multiplier": "Mnożnik złota",
  "host_modal.gold_multiplier_placeholder": "2.0x",
  "host_modal.hard_nations": "Trudne narody",
  "host_modal.host_cheats": "Kody założyciela",
  "host_modal.leave_confirmation": "Na pewno chcesz opuścić lobby?",
  "host_modal.mins_placeholder": "Min",
  "host_modal.nation_player": "Naród",
  "host_modal.nation_players": "Narody",
  "host_modal.nations_disabled": "Wyłączone",
  "host_modal.player_immunity_duration": "Czas ochrony PVP (minuty)",
  "host_modal.random_spawn": "Losowy start",
  "host_modal.remove_player": "Usuń {username}",
  "host_modal.start_delay": "Opóźnienie startu (sekundy)",
  "host_modal.start_delay_placeholder": "3",
  "host_modal.starting_gold": "Złoto początkowe (miliony)",
  "host_modal.starting_gold_placeholder": "5",
  "host_modal.starting_in": "Start za {time}. Kliknij, aby anulować",
  "host_modal.teams_Duos": "Dwójki (drużyny po 2)",
  "host_modal.teams_Humans Vs Nations": "Ludzie kontra Narody",
  "host_modal.teams_Quads": "Czwórki (drużyny po 4)",
  "host_modal.teams_Trios": "Trójki (drużyny po 3)",
  "host_modal.water_nukes": "Zaklęcia na wodzie",

  "kick_reason.admin": "Wyrzucony przez administratora",
  "kick_reason.duplicate_session":
    "Wyrzucony z gry (mogłeś grać na innej karcie)",
  "kick_reason.host_left": "Założyciel opuścił lobby.",
  "kick_reason.lobby_creator": "Wyrzucony przez założyciela lobby",

  "leaderboard.maxtroops": "Maks. wojsk",
  "leaderboard_modal.clan": "Klan",
  "leaderboard_modal.clans_tab": "Klany",
  "leaderboard_modal.elo": "ELO",
  "leaderboard_modal.error": "Błąd wczytywania rankingu",
  "leaderboard_modal.games": "Gry",
  "leaderboard_modal.loading": "Wczytywanie...",
  "leaderboard_modal.loss_score": "Wynik porażek",
  "leaderboard_modal.loss_score_tooltip":
    "Ważone porażki wg udziału klanu i trudności meczu",
  "leaderboard_modal.no_data_yet": "Brak danych",
  "leaderboard_modal.no_stats": "Brak statystyk",
  "leaderboard_modal.player": "Gracz",
  "leaderboard_modal.rank": "Pozycja",
  "leaderboard_modal.ranked_tab": "Ranking 1v1",
  "leaderboard_modal.ratio": "Stosunek",
  "leaderboard_modal.refresh_time": "Odświeżane co godzinę",
  "leaderboard_modal.title": "Ranking",
  "leaderboard_modal.try_again": "Spróbuj ponownie",
  "leaderboard_modal.win_loss_ratio": "Wygrane/Przegrane",
  "leaderboard_modal.win_score": "Wynik zwycięstw",
  "leaderboard_modal.win_score_tooltip":
    "Ważone zwycięstwa wg udziału klanu i trudności meczu",
  "leaderboard_modal.your_ranking": "Twoja pozycja",

  "main.account": "Konto",
  "main.clans": "Klany",
  "main.copyright": "© OpenFront™ i Współtwórcy",
  "main.create": "Utwórz lobby",
  "main.discord_avatar_alt": "Awatar profilu Discord",
  "main.game_info": "Informacje o grze",
  "main.github": "GitHub",
  "main.go_to_troubleshooting": "Przejdź do rozwiązywania problemów",
  "main.help": "Pomoc",
  "main.join": "Dołącz do lobby",
  "main.leaderboard": "Ranking",
  "main.menu": "Menu",
  "main.news": "Aktualności",
  "main.play": "Graj",
  "main.settings": "Ustawienia",
  "main.sign_in": "Zaloguj się",
  "main.solo": "Solo",
  "main.store": "Sklep",
  "main.troubleshooting": "Rozwiązywanie problemów",
  "main.user_avatar_alt": "Awatar gracza {username}",

  "map.aegean": "Morze Egejskie",
  "map.all": "Wszystkie",
  "map.world": "Świat",
  "map.random": "Losowa",
  "map.europe": "Europa",
  "map.northamerica": "Ameryka Północna",
  "map.southamerica": "Ameryka Południowa",
  "map.asia": "Azja",
  "map.africa": "Afryka",
  "map.japan": "Japonia",
  "map.alps": "Alpy",
  "map.amazonriver": "Amazonka",
  "map.antarctica": "Antarktyda",
  "map.archipelagosea": "Morze Archipelagowe",
  "map.arctic": "Arktyka",
  "map.bajacalifornia": "Kalifornia Dolna",
  "map.balkans": "Bałkany",
  "map.beringsea": "Morze Beringa",
  "map.beringstrait": "Cieśnina Beringa",
  "map.bosphorusstraits": "Cieśnina Bosfor",
  "map.britanniaclassic": "Brytania (klasyczna)",
  "map.caribbean": "Karaiby",
  "map.caucasus": "Kaukaz",
  "map.choppingblock": "Pieniek",
  "map.conakry": "Konakry",
  "map.danishstraits": "Cieśniny Duńskie",
  "map.didier": "Didier",
  "map.didierfrance": "Didier (Francja)",
  "map.dyslexdria": "Dyslexdria",
  "map.favorites": "Ulubione",
  "map.featured": "Polecane",
  "map.fourislands": "Cztery Wyspy",
  "map.greatlakes": "Wielkie Jeziora",
  "map.gulfofstlawrence": "Zatoka Świętego Wawrzyńca",
  "map.hawaii": "Hawaje",
  "map.hongkong": "Hongkong",
  "map.indiansubcontinent": "Subkontynent Indyjski",
  "map.juandefucastrait": "Cieśnina Juana de Fuki",
  "map.korea": "Korea",
  "map.labyrinth": "Labirynt",
  "map.lemnos": "Lemnos",
  "map.lisbon": "Lizbona",
  "map.losangeles": "Los Angeles",
  "map.luna": "Księżyc",
  "map.manicouagan": "Manicouagan",
  "map.marenostrum": "Mare Nostrum",
  "map.middleeast": "Bliski Wschód",
  "map.milkyway": "Droga Mleczna",
  "map.mississippiriver": "Missisipi",
  "map.newyorkcity": "Nowy Jork",
  "map.niledelta": "Delta Nilu",
  "map.northwestpassage": "Przejście Północno-Zachodnie",
  "map.onion": "Cebula",
  "map.passage": "Przejście",
  "map.sanfrancisco": "San Francisco",
  "map.sierpinski": "Sierpiński",
  "map.southeastasia": "Azja Południowo-Wschodnia",
  "map.straitofhormuz": "Cieśnina Ormuz",
  "map.straitofmalacca": "Cieśnina Malakka",
  "map.surrounded": "Otoczeni",
  "map.svalmel": "Svalmel",
  "map.taiwanstrait": "Cieśnina Tajwańska",
  "map.thebox": "Pudło",
  "map.titan": "Tytan",
  "map.tourney1": "Turniej 2 drużyny",
  "map.tourney2": "Turniej 3 drużyny",
  "map.tourney3": "Turniej 4 drużyny",
  "map.tourney4": "Turniej 8 drużyn",
  "map.tradersdream": "Sen Kupca",
  "map.twolakes": "Dwa Jeziora",
  "map.venice": "Wenecja",
  "map.worldinverted": "Świat odwrócony",
  "map.yellowsea": "Morze Żółte",

  "map_categories.africa": "Afryka",
  "map_categories.antarctica": "Antarktyda",
  "map_categories.asia": "Azja",
  "map_categories.cosmic": "Kosmos",
  "map_categories.europe": "Europa",
  "map_categories.favorites": "Ulubione",
  "map_categories.featured": "Polecane",
  "map_categories.north_america": "Ameryka Północna",
  "map_categories.oceania": "Oceania",
  "map_categories.other": "Inne",
  "map_categories.south_america": "Ameryka Południowa",
  "map_categories.special": "Specjalne",
  "map_categories.tournament": "Turniej",
  "map_categories.world": "Świat",

  "map_component.error": "Błąd",
  "map_component.favorite": "Dodaj do ulubionych",
  "map_component.favorites_empty":
    "Kliknij gwiazdkę na dowolnej mapie, aby dodać ją do ulubionych",
  "map_component.unfavorite": "Usuń z ulubionych",

  "matchmaking_button.description": "(ALFA)",
  "matchmaking_button.login_required": "Zaloguj się, aby grać rankingowo!",
  "matchmaking_button.must_login":
    "Musisz być zalogowany, aby grać w rankingowym matchmakingu.",
  "matchmaking_button.play_ranked": "Rankingowy matchmaking 1v1",
  "matchmaking_modal.elo": "Twoje ELO: {elo}",
  "matchmaking_modal.no_elo": "Brak ELO",

  "mode_selector.coming_soon": "Wkrótce",
  "mode_selector.ranked_1v1_title": "1v1",
  "mode_selector.ranked_2v2_title": "2v2",
  "mode_selector.ranked_title": "Rankingowe",
  "mode_selector.teams_count": "{teamCount} drużyn",
  "mode_selector.teams_of": "{teamCount} drużyn po {playersPerTeam}",
  "mode_selector.teams_title": "Drużyny",

  "news_box.dismiss": "Zamknij",
  "news_box.firefox_warning":
    "OpenFront.io działa słabo w [przeglądarkach opartych na Firefoksie](https://simple.wikipedia.org/wiki/Web_browsers_based_on_Firefox). Zalecamy [przeglądarkę opartą na Chromium](https://en.wikipedia.org/wiki/Chromium_(web_browser)#Browsers_based_on_Chromium) dla najlepszej wydajności.",
  "news_box.go_to_item": "Przejdź do elementu {num}",
  "news_box.news": "AKTUALNOŚCI",
  "news_box.tournament": "TURNIEJ",
  "news_box.tutorial": "SAMOUCZEK",
  "news_box.warning": "OSTRZEŻENIE",

  "performance_overlay.avg_60s": "Śr. (60 s):",
  "performance_overlay.collapse": "Zwiń",
  "performance_overlay.copied": "Skopiowano!",
  "performance_overlay.copy_clipboard": "Kopiuj JSON",
  "performance_overlay.copy_json_title":
    "Skopiuj bieżące metryki wydajności jako JSON",
  "performance_overlay.expand": "Rozwiń",
  "performance_overlay.failed_copy": "Nie udało się skopiować",
  "performance_overlay.fps": "FPS:",
  "performance_overlay.frame": "Klatka:",
  "performance_overlay.layers_header": "Warstwy renderowania",
  "performance_overlay.max_label": "maks.:",
  "performance_overlay.render_layers_summary":
    "Ostatni tik: {frames} klatek, {ms} ms",
  "performance_overlay.render_layers_table_header": "śr. / maks. | śr. tiku",
  "performance_overlay.reset": "Resetuj",
  "performance_overlay.tick_delay": "Opóźnienie tiku:",
  "performance_overlay.tick_exec": "Wykonanie tiku:",
  "performance_overlay.tick_layers_header": "Warstwy tiku",
  "performance_overlay.tick_layers_summary":
    "Ostatni tik: {count} warstw, {ms} ms",
  "performance_overlay.tick_layers_table_header": "śr. / maks.",
  "performance_overlay.tps": "TPS:",
  "performance_overlay.tps_avg_60s": "Śr.:",

  "player_panel.arc_down": "Łuk w dół",
  "player_panel.arc_up": "Łuk w górę",
  "player_panel.flip_rocket_trajectory": "Odwróć tor pocisku",
  "player_panel.kick": "Wyrzuć gracza",
  "player_panel.kick_confirm":
    "Wyrzucić {name}?\n\nNie będzie mógł ponownie dołączyć do tej gry.",
  "player_panel.kicked": "Już wyrzucony",
  "player_panel.moderation": "Moderacja",

  "player_stats_tree.no_stats": "Brak statystyk dla tego wyboru.",
  "player_stats_tree.ranked": "Rankingowe",
  "player_stats_tree.ranked_1v1": "1v1",
  "player_stats_tree.solo": "Solo",

  "private_lobby.disabled_units": "Wyłączone jednostki",
  "private_lobby.game_length": "Długość gry",
  "private_lobby.host_cheats": "Kody założyciela",
  "private_lobby.pvp_immunity": "Czas ochrony PVP",
  "private_lobby.starting_gold": "Złoto początkowe",

  "public_game_modifier.compact_map": "Zwarta mapa",
  "public_game_modifier.crowded": "Zatłoczona",
  "public_game_modifier.disable_alliances": "Sojusze wyłączone",
  "public_game_modifier.disable_alliances_label": "Sojusze",
  "public_game_modifier.gold_multiplier": "x{amount} mnożnik złota",
  "public_game_modifier.hard_nations": "Trudne narody",
  "public_game_modifier.nukes_disabled": "Zaklęcia wyłączone",
  "public_game_modifier.nukes_disabled_label": "Zaklęcia",
  "public_game_modifier.peace_time": "4 min pokoju",
  "public_game_modifier.peace_time_label": "Ochrona PVP",
  "public_game_modifier.ports_disabled": "Przystanie wyłączone",
  "public_game_modifier.ports_disabled_label": "Przystanie",
  "public_game_modifier.random_spawn": "Losowy start",
  "public_game_modifier.sams_disabled": "Wieże łucznicze wyłączone",
  "public_game_modifier.sams_disabled_label": "Wieże łucznicze",
  "public_game_modifier.starting_gold": "{amount}M złota początkowego",
  "public_game_modifier.starting_gold_label": "Złoto początkowe",
  "public_game_modifier.water_nukes": "Zaklęcia na wodzie",
  "public_game_modifier.water_nukes_label": "Zaklęcia na wodzie",

  "single_modal.disable_alliances": "Wyłącz sojusze",
  "single_modal.gold_multiplier": "Mnożnik złota",
  "single_modal.gold_multiplier_placeholder": "2.0x",
  "single_modal.max_timer_invalid":
    "Podaj prawidłowy limit czasu (1–120 minut)",
  "single_modal.max_timer_placeholder": "Min",
  "single_modal.nations_disabled": "Wyłączone",
  "single_modal.options_changed_no_achievements":
    "Własne ustawienia – osiągnięcia wyłączone",
  "single_modal.random_spawn": "Losowy start",
  "single_modal.sign_in_for_achievements": "Zaloguj się po osiągnięcia",
  "single_modal.starting_gold": "Złoto początkowe (miliony)",
  "single_modal.starting_gold_placeholder": "5",
  "single_modal.toggle_achievements": "Przełącz osiągnięcia",
  "single_modal.water_nukes": "Zaklęcia na wodzie",

  "team_colors.humans": "Ludzie",
  "team_colors.nations": "Narody",

  "territory_patterns.search": "Szukaj...",
  "territory_patterns.select_skin": "Wybierz skórkę",
  "territory_patterns.selected": "wybrano",

  "troubleshooting.battery": "Bateria",
  "troubleshooting.battery_level": "Poziom baterii",
  "troubleshooting.browser": "Przeglądarka",
  "troubleshooting.canvas_2d_no_gpu": "Canvas 2D (bez GPU)",
  "troubleshooting.charging": "Ładowanie",
  "troubleshooting.chromium_tip":
    "OpenFront działa najlepiej w przeglądarkach opartych na Chromium.",
  "troubleshooting.copied_to_clipboard":
    "Informacje skopiowane do schowka! Możesz je udostępnić na naszym Discordzie, jeśli potrzebujesz pomocy.",
  "troubleshooting.device_pixel_ratio": "Współczynnik pikseli urządzenia",
  "troubleshooting.environment": "Środowisko",
  "troubleshooting.gpu": "GPU",
  "troubleshooting.gpu_tip":
    "Sprawdź, czy to dedykowane GPU, jeśli jest dostępne.",
  "troubleshooting.hardware_acceleration_tip":
    "Upewnij się, że akceleracja sprzętowa jest włączona w ustawieniach przeglądarki.",
  "troubleshooting.high_precision_shaders": "Shadery wysokiej precyzji",
  "troubleshooting.max_texture_size": "Maks. rozmiar tekstury",
  "troubleshooting.no": "Nie",
  "troubleshooting.os": "System",
  "troubleshooting.platform": "Platforma",
  "troubleshooting.power": "Zasilanie",
  "troubleshooting.power_saving_tip":
    "Upewnij się, że przeglądarka nie działa w trybie oszczędzania energii.",
  "troubleshooting.renderer": "Renderer",
  "troubleshooting.rendering": "Renderowanie",
  "troubleshooting.software_rendering": "Renderowanie programowe",
  "troubleshooting.title": "Rozwiązywanie problemów",
  "troubleshooting.unavailable": "Niedostępne",
  "troubleshooting.unknown": "Nieznane",
  "troubleshooting.yes": "Tak",

  "unit_type.boat": "Łódź",

  "user_setting.ally_keybinds": "Skróty sojusznicze",
  "user_setting.attack_ratio_increment_desc":
    "O ile skrót zmienia współczynnik ataku na jedno naciśnięcie/przewinięcie.",
  "user_setting.attack_ratio_increment_label": "Krok współczynnika ataku",
  "user_setting.attacking_troops_overlay_desc":
    "Pokazuj liczbę atakujących i obrońców na aktywnych liniach frontu.",
  "user_setting.attacking_troops_overlay_label": "Nakładka atakujących wojsk",
  "user_setting.break_alliance": "Zerwij sojusz (zdrada)",
  "user_setting.break_alliance_desc":
    "Zerwij sojusz z graczem, którego pole jest pod kursorem.",
  "user_setting.build_menu_modifier": "Modyfikator menu budowy",
  "user_setting.build_menu_modifier_desc":
    "Przytrzymaj ten klawisz podczas klikania, aby otworzyć menu budowy.",
  "user_setting.colorblind_desc":
    "Użyj kolorów terytorium i granic przyjaznych dla daltonistów",
  "user_setting.colorblind_label": "Tryb dla daltonistów",
  "user_setting.coordinate_grid_desc":
    "Przełącz alfanumeryczną siatkę współrzędnych",
  "user_setting.coordinate_grid_label": "Siatka współrzędnych",
  "user_setting.cursor_cost_label_desc":
    "Pokaż koszt pod ikoną kursora budowy",
  "user_setting.cursor_cost_label_label": "Koszt budowy przy kursorze",
  "user_setting.development_only": "Tylko dla deweloperów",
  "user_setting.emoji_menu_modifier": "Modyfikator menu emoji",
  "user_setting.emoji_menu_modifier_desc":
    "Przytrzymaj ten klawisz podczas klikania, aby otworzyć menu emoji.",
  "user_setting.game_speed_down": "Zwolnij grę",
  "user_setting.game_speed_down_desc":
    "Przełącz na poprzednią prędkość gry. Tylko tryb jednoosobowy.",
  "user_setting.game_speed_up": "Przyspiesz grę",
  "user_setting.game_speed_up_desc":
    "Przełącz na następną prędkość (0.5, 1, 2, maks.). Tylko tryb jednoosobowy.",
  "user_setting.go_to_player_desc":
    "Przełącz przybliżanie na gracza na początku gry.",
  "user_setting.go_to_player_label": "Przybliż do gracza na starcie",
  "user_setting.graphics_settings_desc": "Dostosuj wygląd mapy",
  "user_setting.graphics_settings_label": "Ustawienia grafiki",
  "user_setting.help_messages_desc":
    "Pokazuj kontekstowe wskazówki i ostrzeżenia podczas gry, np. o limicie armii.",
  "user_setting.help_messages_label": "Komunikaty pomocy",
  "user_setting.keybind_conflict_error":
    "Klawisz {key} jest już przypisany do innej akcji.",
  "user_setting.keybinds_hint":
    "Kliknij klawisz, aby go przypisać. Możesz użyć pojedynczego klawisza lub kombinacji Shift + klawisz.",
  "user_setting.menu_shortcuts": "Skróty menu",
  "user_setting.pause_game": "Wstrzymaj",
  "user_setting.pause_game_desc":
    "Wstrzymaj lub wznów grę (tryb jednoosobowy i gry własne dla założyciela).",
  "user_setting.press_a_key": "Naciśnij klawisz",
  "user_setting.render_debug_gui": "Panel debugowania renderera",
  "user_setting.render_debug_gui_desc":
    "Przełącz panel strojenia renderera",
  "user_setting.request_alliance": "Zaproponuj sojusz",
  "user_setting.request_alliance_desc":
    "Wyślij prośbę o sojusz do gracza, którego pole jest pod kursorem.",
  "user_setting.retaliate_attack": "Odwet",
  "user_setting.retaliate_attack_desc":
    "Wyślij atak odwetowy, by osłabić ostatniego napastnika. Dostępne tylko gdy jesteś atakowany.",
  "user_setting.swap_direction": "Zmień kierunek pocisku",
  "user_setting.swap_direction_desc":
    "Przełącz kierunek wystrzału pocisku (góra/dół).",
  "user_setting.toggle_visibility": "Przełącz widoczność",

  "username.tag": "TAG",
  "username.tag_invalid_chars":
    "Tag klanu może zawierać tylko litery i cyfry.",
  "username.tag_not_member":
    "Dołącz do klanu {tag}, zanim użyjesz jego tagu. Kliknij tę wiadomość, aby dołączyć.",
  "username.tag_too_long": "Tag klanu nie może przekraczać 5 znaków.",
  "username.tag_too_short": "Tag klanu musi mieć 2–5 znaków alfanumerycznych.",

  "win_modal.discord_description":
    "Poznawaj graczy, odkrywaj nowości i wygrywaj nagrody!",
  "win_modal.join_discord": "Dołącz do naszej społeczności na Discordzie!",
  "win_modal.join_server": "Dołącz do serwera",
  "win_modal.nation_won": "Naród {nation} wygrał!",
  "win_modal.requeue": "Zagraj ponownie",
  "win_modal.youtube_tutorial": "Potrzebujesz pomocy?",
};

/**
 * Returns the supplementary Polish translation for a key when FANTASY_THEME is
 * on, otherwise undefined (caller falls back to the English default).
 */
export function plSupplementOverride(key: string): string | undefined {
  if (!ClientEnv.fantasyTheme()) return undefined;
  return PL_SUPPLEMENT[key];
}
