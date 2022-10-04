export interface EpicGamesCacheDocument {
    title: string;
    description: string;
    imageUrl: string;
    urlSlug: string;
    promotion: Promotion;
}
interface Promotion {
    startDate: string,
    endDate: string
}
