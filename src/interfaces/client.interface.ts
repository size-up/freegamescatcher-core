/////////////////////////////////////////////////////
///////////////// CLIENT_PLATFORM_TYPE //////////////////
/////////////////////////////////////////////////////
export type ClientPlatformType = "epicgames" 
| "twitch";

/////////////////////////////////////////////////////
///////////////// CLIENT_INTERFACE //////////////////
/////////////////////////////////////////////////////
export interface ClientInterface {
    url: string,
    params: Object
}

/////////////////////////////////////////////////////
//////////// EPIC_GAMES_DATAS_INTERFACE /////////////
/////////////////////////////////////////////////////
interface KeyImage {
    type: string;
    url: string;
}

interface Seller {
    id: string;
    name: string;
}

interface Item {
    id: string;
    namespace: string;
}

interface CustomAttribute {
    key: string;
    value: string;
}

interface Category {
    path: string;
}

interface Tag {
    id: string;
}

interface Mapping {
    pageSlug: string;
    pageType: string;
}

interface CatalogNs {
    mappings: Mapping[];
}

interface OfferMapping {
    pageSlug: string;
    pageType: string;
}

interface CurrencyInfo {
    decimals: number;
}

interface FmtPrice {
    originalPrice: string;
    discountPrice: string;
    intermediatePrice: string;
}

interface TotalPrice {
    discountPrice: number;
    originalPrice: number;
    voucherDiscount: number;
    discount: number;
    currencyCode: string;
    currencyInfo: CurrencyInfo;
    fmtPrice: FmtPrice;
}

interface DiscountSetting {
    discountType: string;
}

interface AppliedRule {
    id: string;
    endDate: Date;
    discountSetting: DiscountSetting;
}

interface LineOffer {
    appliedRules: AppliedRule[];
}

interface Price {
    totalPrice: TotalPrice;
    lineOffers: LineOffer[];
}

interface DiscountSetting2 {
    discountType: string;
    discountPercentage: number;
}

interface PromotionalOffer2 {
    startDate: Date;
    endDate: Date;
    discountSetting: DiscountSetting2;
}

interface PromotionalOffer {
    promotionalOffers: PromotionalOffer2[];
}

interface DiscountSetting3 {
    discountType: string;
    discountPercentage: number;
}

interface PromotionalOffer3 {
    startDate: Date;
    endDate: Date;
    discountSetting: DiscountSetting3;
}

interface UpcomingPromotionalOffer {
    promotionalOffers: PromotionalOffer3[];
}

interface Promotions {
    promotionalOffers: PromotionalOffer[];
    upcomingPromotionalOffers: UpcomingPromotionalOffer[];
}

interface Element {
    title: string;
    id: string;
    namespace: string;
    description: string;
    effectiveDate: Date;
    offerType: string;
    expiryDate?: Date;
    status: string;
    isCodeRedemptionOnly: boolean;
    keyImages: KeyImage[];
    seller: Seller;
    productSlug: string;
    urlSlug: string;
    url?: string;
    items: Item[];
    customAttributes: CustomAttribute[];
    categories: Category[];
    tags: Tag[];
    catalogNs: CatalogNs;
    offerMappings: OfferMapping[];
    price: Price;
    promotions: Promotions;
}

interface Paging {
    count: number;
    total: number;
}

interface SearchStore {
    elements: Element[];
    paging: Paging;
}

interface Catalog {
    searchStore: SearchStore;
}

interface Data {
    data: Data2;
}

interface Data2 {
    Catalog: Catalog;
}

export interface EpicGamesDatasInterface {
    data: Data;
}


