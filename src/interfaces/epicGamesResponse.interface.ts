

export interface Seller {
    id: string;
    name: string;
}

export interface Tag {
    id: string;
}

export interface Mapping {
    pageSlug: string;
    pageType: string;
}

export interface CatalogNs {
    mappings: Mapping[];
}

export interface OfferMapping {
    pageSlug: string;
    pageType: string;
}

export interface CurrencyInfo {
    decimals: number;
}

export interface FmtPrice {
    originalPrice: string;
    discountPrice: string;
    intermediatePrice: string;
}

export interface TotalPrice {
    discountPrice: number;
    originalPrice: number;
    voucherDiscount: number;
    discount: number;
    currencyCode: string;
    currencyInfo: CurrencyInfo;
    fmtPrice: FmtPrice;
}

export interface DiscountSetting {
    discountType: string;
}

export interface AppliedRule {
    id: string;
    endDate: Date;
    discountSetting: DiscountSetting;
}

export interface LineOffer {
    appliedRules: AppliedRule[];
}

export interface Price {
    totalPrice: TotalPrice;
    lineOffers: LineOffer[];
}

export interface DiscountSetting2 {
    discountType: string;
    discountPercentage: number;
}

export interface PromotionalOffer2 {
    startDate: Date;
    endDate: Date;
    discountSetting: DiscountSetting2;
}



export interface DiscountSetting3 {
    discountType: string;
    discountPercentage: number;
}

export interface PromotionalOffer3 {
    startDate: Date;
    endDate: Date;
    discountSetting: DiscountSetting3;
}

export interface UpcomingPromotionalOffer {
    promotionalOffers: PromotionalOffer3[];
}




export interface Paging {
    count: number;
    total: number;
}


export interface Extensions {
    foo: string;
}

export interface RootObject {
    data: Data;
    extensions: Extensions;
}








export interface Data {
    Catalog: Catalog;
}    

export interface Catalog {
    searchStore: SearchStore;
}    


export interface SearchStore {
    elements: Element[];
    paging: Paging;
}


export interface Element {
    title: string;
    description: string;
    effectiveDate: Date;
    keyImages: KeyImage[];
    urlSlug: string;
    promotions: Promotions;
}


export interface KeyImage {
    type: string;
    url: string;
}


export interface Promotions {
    promotionalOffers: PromotionalOffer[];
    upcomingPromotionalOffers: UpcomingPromotionalOffer[];
}

export interface PromotionalOffer {
    promotionalOffers: PromotionalOffer2[];
}