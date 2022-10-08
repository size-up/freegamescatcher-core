import { GameCacheDocumentInterface } from "./cache.interface";

export interface DatasToCompileInterface {
    availableGames: GameCacheDocumentInterface[]
    nextGames: GameCacheDocumentInterface[]
}
