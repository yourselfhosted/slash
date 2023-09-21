package license

import (
	"fmt"
	"time"

	"github.com/patrickmn/go-cache"
)

var (
	licenseCache = cache.New(24*time.Hour, 24*time.Hour)
)

func SetLicenseCache(licenseKey, instanceName string, license LicenseKey) {
	licenseCache.Set(fmt.Sprintf("%s-%s", licenseKey, instanceName), license, 24*time.Hour)
}

func GetLicenseCache(licenseKey, instanceName string) *LicenseKey {
	cache, ok := licenseCache.Get(fmt.Sprintf("%s-%s", licenseKey, instanceName))
	if !ok {
		return nil
	}
	return cache.(*LicenseKey)
}
