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
                        urlSlug: `https://store.epicgames.com/fr/p/${game.catalogNs.mappings[0].pageSlug}`,
                        promotion: {
                            startDate: game.promotions.promotionalOffers.length ? 
                                game.promotions.promotionalOffers[0].promotionalOffers[0].startDate.toString() : 
                                game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate.toString(),
                            endDate: game.promotions.promotionalOffers.length ? 
                                game.promotions.promotionalOffers[0].promotionalOffers[0].endDate.toString() : 
                                game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].endDate.toString(),
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
