export type Asset = {
    asset: string;
    free: string;
    locked: string;
}

export type Coin = {
    name: string;
    symbol: string;
    geckoId: string;
}


export type ClientAccount = {
    balances: Asset[]
}

export type PriceData = {
    id: string;
    symbol: string;
    last_updated_at: string;
    sek: string,
    usd: string,
    date: string,
}

export type AxiosFetchError = {
    isAxiosError: boolean
}