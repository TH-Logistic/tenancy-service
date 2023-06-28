export enum TenantPackage {
    BASIC = 0,
    PREMIUM = 1,
    ULTIMATE = 2
}

const getTenantPackageName = (value: TenantPackage): string => {
    switch (value) {
        case TenantPackage.BASIC:
            return "Basic";
        case TenantPackage.PREMIUM:
            return "Premium";
        case TenantPackage.ULTIMATE:
            return "Ultimate"
    }
}

export { getTenantPackageName }