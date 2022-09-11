import { ElementToSendInterface, EpicGamesDatasInterface } from "../../interfaces/client.interface";

export class EpicGamesMapperHelper {

    static map(data: EpicGamesDatasInterface): ElementToSendInterface[] {
        try {
            const epicGamesElements = data.data.data.Catalog.searchStore.elements;
            const newElementsToSave: ElementToSendInterface[] = epicGamesElements.filter(filteredGame => filteredGame.promotions && 
                (filteredGame.promotions.promotionalOffers.length || filteredGame.promotions.upcomingPromotionalOffers.length))
                .map(game => {
                    const newElement: ElementToSendInterface = {
                        title: game.title,
                        description: game.description,
                        urlSlug: game.urlSlug,
                        promotion: {
                            startDate: game.promotions.promotionalOffers.length ? 
                                game.promotions.promotionalOffers[0].promotionalOffers[0].startDate : 
                                game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate,
                            endDate: game.promotions.promotionalOffers.length ? 
                                game.promotions.promotionalOffers[0].promotionalOffers[0].endDate : 
                                game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].endDate,
                        },
                        imageUrl: game.keyImages[1].url
                    };
                    return newElement;
                });
            return newElementsToSave;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            throw new Error(err.stack);
        }
    }
}
