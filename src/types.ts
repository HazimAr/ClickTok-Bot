export interface Sigi {
  AppContext: AppContext;
  SEO: SEO;
  SharingMeta: SharingMeta;
  ItemList: ItemList;
  ItemModule: { [key: string]: ItemModule };
  UserModule: UserModule;
  UserPage: UserPage;
  I18n: I18NClass;
  RecommendUserList: RecommendUserList;
}

export interface AppContext {
  appContext: AppContextClass;
  initialized: boolean;
  lang: string;
  sideNavActive: boolean;
}

export interface AppContextClass {
  $baseUrl: string;
  $fullUrl: string;
  $isAndroid: boolean;
  $isIMessage: boolean;
  $isIOS: boolean;
  $pageUrl: string;
  $host: string;
  $language: string;
  $region: Region;
  $appId: number;
  $appType: string;
  $navList: NavList[];
  $studioDownloadEntrance: StudioDownloadEntrance;
  $downloadLink: DownloadLink;
  $wid: string;
  $deviceLimitRegisterExpired: boolean;
  $abTestVersion: AbTestVersion;
  $os: string;
  $config: Config;
  $subdivisions: string[];
  $nonce: string;
  $csrfToken: string;
  $botType: string;
  $liveSuggestConfig: LiveSuggestConfig;
  $liveCenterConfig: LiveCenterConfig;
  $isMobile: boolean;
  $sgOpen: boolean;
  $encryptedWebid: string;
  $geo: number[];
  $geoCity: GeoCity;
  $requestId: string;
  $searchVideoForLoggedin: boolean;
  $domains: Domains;
  $isTTP: boolean;
  $isGoogleBot: boolean;
  $isBingBot: boolean;
  $isBot: boolean;
  $liveStudioEnable: boolean;
  $dateFmtLocale: DateFmtLocale;
}

export interface AbTestVersion {
  versionName: string;
  parameters: AbTestVersionParameters;
}

export interface AbTestVersionParameters {
  video_feed_redesign: AddTranscript;
  xgplayer_preload_test: AddTranscript;
  video_topic: AddTranscript;
  em_follow_p2_test: AddTranscript;
  sharing_user_redesign: MobileVideoDetailRefactor;
  non_login_comment_video_detail_page: AddTranscript;
  enhance_video_consumption_test: AddTranscript;
  seekbar_theme_test: AddTranscript;
  share_button_embed_test: AddTranscript;
  share_button_part1_test: AddTranscript;
  web_push_test: AddTranscript;
  user_page_video_desc_test: MobileVideoDetailRefactor;
  increase_detail_page_cover_quantity_test: AddTranscript;
  dm_video_share_test: AddTranscript;
  delete_webid_v2_test: DeleteWebidV2Test;
  seekbar_persistent_and_tooltip_test: AddTranscript;
  bc_label: AddTranscript;
  search_video: AddTranscript;
  mobile_video_detail_refactor: MobileVideoDetailRefactor;
  message_refactor: AddTranscript;
  setting_refactor: AddTranscript;
  mobile_refactor_non_login: AddTranscript;
  add_transcript: AddTranscript;
  creator_center_test: AddTranscript;
  live_api_events_test: AddTranscript;
  live_end_improved_metrics: AddTranscript;
  live_top_viewers: AddTranscript;
  search_video_lab: AddTranscript;
}

export interface AddTranscript {
  vid: string;
}

export interface DeleteWebidV2Test {
  vid: string;
  generateWebidV2: boolean;
}

export interface MobileVideoDetailRefactor {
  vid: string;
  botVid: string;
}

export interface Config {
  sgOpen: SgOpen;
  signUpOpen: boolean;
  cookieBanner: CookieBanner;
}

export interface CookieBanner {
  load_dynamically: boolean;
  decline_btn_staged_rollout_area: string[];
  resource: Resource;
  i18n: I18N;
}

export interface I18N {
  cookieBannerTitle: string;
  cookieBannerTitleNew: string;
  cookieBannerSubTitle: string;
  cookieBannerSubTitleNew: string;
  cookieBannerSubTitleV2: string;
  cookieBannerBtnManage: string;
  cookieBannerBtnAccept: string;
  cookieBannerBtnDecline: string;
  cookiesBannerDetails: string;
  cookiesBannerCookiesPolicy: string;
  cookiesBannerAccept: string;
  webDoNotSellSettingsSavedToast: string;
  cookieSettingManageYourCookieTitle: string;
  cookieSettingSave: string;
  cookieSettingAnalyticsAndMarketing: string;
  cookieSettingNecessary: string;
  cookieSettingNecessarySubtitle: string;
  cookieSettingAnalyticsAndMarketingSubtitle: string;
}

export interface Resource {
  esm: string;
  nomodule: string;
  baseUrl: string;
  version: string;
}

export interface SgOpen {
  SG_OPEN: boolean;
  BOT_THRESHOLD: number;
  EXCLUDE_REGIONS: string[];
}

export interface DateFmtLocale {
  name: string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  longDateFormat: LongDateFormat;
  meridiem: Meridiem;
}

export interface LongDateFormat {
  LT: string;
  LTS: string;
  L: string;
  LL: string;
  LLL: string;
  LLLL: string;
  l: string;
  ll: string;
  lll: string;
  llll: string;
  "LL-Y": string;
}

export interface Meridiem {
  am: string;
  pm: string;
  AM: string;
  PM: string;
}

export interface Domains {
  kind: string;
  captcha: string;
  imApi: string;
  imFrontier: string;
  mTApi: string;
  rootApi: string;
  secSDK: string;
  slardar: string;
  starling: string;
  tea: string;
  webcastApi: string;
  webcastRootApi: string;
  tcc: string;
  search: string;
}

export interface DownloadLink {
  microsoft: Amazon;
  apple: Amazon;
  amazon: Amazon;
  google: Amazon;
}

export interface Amazon {
  visible: boolean;
  normal: string;
}

export interface GeoCity {
  City: string;
  Subdivisions: string;
  SubdivisionsArr: string[];
}

export interface LiveCenterConfig {
  entrance: boolean;
  showCreatorHubRegion: string[];
}

export interface LiveSuggestConfig {
  isBlockedArea: boolean;
  isRiskArea: boolean;
}

export interface NavList {
  title: string;
  children: Child[];
}

export interface Child {
  title: string;
  href: string;
  key?: string;
}

export enum Region {
  Us = "US",
}

export interface StudioDownloadEntrance {
  regions: string[];
}

export interface I18NClass {
  lang: string;
  translations: Translations;
}

export interface Translations {
  en: En;
}

export interface En {
  Webapp: { [key: string]: string };
}

export interface ItemList {
  "user-post": User;
  "user-liked": User;
}

export interface User {
  list: string[];
  browserList: string[];
  loading: boolean;
  statusCode: number;
  hasMore: boolean;
  cursor: string;
  preloadList: PreloadList[];
}

export interface PreloadList {
  url: string;
  id: string;
}

export interface ItemModule {
  id: string;
  desc: string;
  createTime: string;
  scheduleTime: number;
  video: Video;
  author: string;
  music: Music;
  challenges: Challenge[];
  stats: ItemModuleStats;
  duetInfo: DuetInfo;
  warnInfo: any[];
  originalItem: boolean;
  officalItem: boolean;
  textExtra: TextExtra[];
  secret: boolean;
  forFriend: boolean;
  digged: boolean;
  itemCommentStatus: number;
  showNotPass: boolean;
  vl1: boolean;
  takeDown: number;
  itemMute: boolean;
  effectStickers: any[];
  authorStats: AuthorStats;
  privateItem: boolean;
  duetEnabled: boolean;
  stitchEnabled: boolean;
  stickersOnItem: any[];
  isAd: boolean;
  shareEnabled: boolean;
  comments: any[];
  duetDisplay: number;
  stitchDisplay: number;
  indexEnabled: boolean;
  diversificationLabels: string[];
  adAuthorization: boolean;
  adLabelVersion: number;
  locationCreated: Region;
  nickname: Name;
  authorId: string;
  authorSecId: SECUid;
  avatarThumb: string;
}

export enum SECUid {
  MS4WLjABAAAAVASjiXTh7WDDyXvjk10VFhMWUAoxr8BgfO1KAL19S = "MS4wLjABAAAA-VASjiXTh7wDDyXvjk10VFhMWUAoxr8bgfO1kAL1-9s",
}

export interface AuthorStats {
  followerCount: number;
  followingCount: number;
  heart: number;
  heartCount: number;
  videoCount: number;
  diggCount: number;
  needFix?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  desc: string;
  profileLarger: string;
  profileMedium: string;
  profileThumb: string;
  coverLarger: string;
  coverMedium: string;
  coverThumb: string;
  isCommerce: boolean;
  stats: ChallengeStats;
}

export interface ChallengeStats {
  videoCount: number;
  viewCount: number;
}

export interface DuetInfo {
  duetFromId: string;
}

export interface Music {
  id: string;
  title: string;
  playUrl: string;
  coverLarge: string;
  coverMedium: string;
  coverThumb: string;
  authorName: string;
  original: boolean;
  duration: number;
  album: string;
  scheduleSearchTime: number;
}

export enum Name {
  CharliDAmelio = "charli d’amelio",
}

export interface ItemModuleStats {
  diggCount: number;
  shareCount: number;
  commentCount: number;
  playCount: number;
}

export interface TextExtra {
  awemeId: string;
  start: number;
  end: number;
  hashtagId: string;
  hashtagName: string;
  type: number;
  subType: number;
  userId: string;
  isCommerce: boolean;
  userUniqueId: string;
  secUid: string;
}

export interface Video {
  id: string;
  height: number;
  width: number;
  duration: number;
  ratio: Definition;
  cover: string;
  originCover: string;
  dynamicCover: string;
  playAddr: string;
  downloadAddr: string;
  shareCover: string[];
  reflowCover: string;
  bitrate: number;
  encodedType: EncodedType;
  format: Format;
  videoQuality: EncodedType;
  encodeUserTag: string;
  codecType: CodecType;
  definition: Definition;
  subtitleInfos: SubtitleInfo[];
}

export enum CodecType {
  H264 = "h264",
}

export enum Definition {
  The720P = "720p",
}

export enum EncodedType {
  Normal = "normal",
}

export enum Format {
  Mp4 = "mp4",
}

export interface SubtitleInfo {
  LanguageID: string;
  LanguageCodeName: string;
  Url: string;
  UrlExpire: string;
  Format: FormatEnum;
  Version: string;
  Source: Source;
  VideoSubtitleID: number;
  Size: string;
}

export enum FormatEnum {
  Webvtt = "webvtt",
}

export enum Source {
  ASR = "ASR",
  MT = "MT",
}

export interface RecommendUserList {
  uniqueId: string;
}

export interface SEO {
  metaParams: MetaParams;
  jsonldList: Array<Array<JsonldListClass | string>>;
  abtest: Abtest;
  pageType: number;
}

export interface Abtest {
  pageId: string;
  vidList: string[];
  parameters: AbtestParameters;
}

export interface AbtestParameters {
  predict_language: PredictLanguage;
  seo_version: SEOVersion;
  seo_version_uid: SEOVersionUid;
}

export interface PredictLanguage {
  policy_challenge: string;
  policy_music: string;
  policy_question: string;
  policy_video: string;
}

export interface SEOVersion {
  name: string;
  v: number;
}

export interface SEOVersionUid {
  name: string;
}

export interface JsonldListClass {
  itemListElement?: ItemListElement[];
  name?: Name;
  description?: string;
  alternateName?: string;
  mainEntityOfPage?: MainEntityOfPage;
}

export interface ItemListElement {
  "@type": string;
  position: number;
  item: Item;
}

export interface Item {
  "@type": string;
  "@id": string;
  name: string;
}

export interface MainEntityOfPage {
  "@type": string;
  "@id": string;
}

export interface MetaParams {
  title: string;
  keywords: string;
  description: string;
  canonicalHref: string;
  robotsContent: string;
  applicableDevice: string;
}

export interface SharingMeta {
  value: Value;
}

export interface Value {
  "al:ios:url": string;
  "al:android:url": string;
  "al:ios:app_store_id": string;
  "al:ios:app_name": string;
  "al:android:app_name": string;
  "al:android:package": string;
  "og:site_name": string;
  "og:type": string;
  "og:title": string;
  "og:description": string;
  "fb:app_id": string;
  "twitter:app:id:iphone": string;
  "twitter:app:id:googleplay": string;
  "twitter:card": string;
  "twitter:site": string;
  "twitter:title": string;
  "twitter:description": string;
  "og:image": string;
  "twitter:image": string;
  "og:image:width": string;
  "og:image:height": string;
  "og:image:alt": string;
}

export interface UserModule {
  users: Users;
  stats: UserModuleStats;
}

export interface UserModuleStats {
  charlidamelio: AuthorStats;
}

export interface Users {
  charlidamelio: Charlidamelio;
}

export interface Charlidamelio {
  id: string;
  shortId: string;
  uniqueId: string;
  nickname: Name;
  avatarLarger: string;
  avatarMedium: string;
  avatarThumb: string;
  signature: string;
  createTime: number;
  verified: boolean;
  secUid: SECUid;
  ftc: boolean;
  relation: number;
  openFavorite: boolean;
  bioLink: BioLink;
  commentSetting: number;
  duetSetting: number;
  stitchSetting: number;
  privateAccount: boolean;
  secret: boolean;
  isADVirtual: boolean;
  roomId: string;
  isUnderAge18: boolean;
  uniqueIdModifyTime: number;
  ttSeller: boolean;
  extraInfo: ExtraInfo;
}

export interface BioLink {
  link: string;
  risk: number;
}

export interface ExtraInfo {
  statusCode: number;
}

export interface UserPage {
  uniqueId: string;
  statusCode: number;
  secUid: SECUid;
}
