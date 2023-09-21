package license

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/pkg/errors"
)

const (
	// The base API URL for the Lemon Squeezy API.
	baseAPIURL = "https://api.lemonsqueezy.com"
	// The store ID for the yourselfhosted store.
	// Link: https://yourselfhosted.lemonsqueezy.com
	storeID = 15634
	// The product ID for the subscription pro product.
	// Link: https://yourselfhosted.lemonsqueezy.com/checkout/buy/d03a2696-8a8b-49c9-9e19-d425e3884fd7
	subscriptionProProductID = 98995
)

type LicenseKey struct {
	ID        int32   `json:"id"`
	Status    string  `json:"status"`
	Key       string  `json:"key"`
	CreatedAt string  `json:"created_at"`
	ExpiresAt *string `json:"updated_at"`
}

type LicenseKeyMeta struct {
	StoreID       int32  `json:"store_id"`
	OrderID       int32  `json:"order_id"`
	OrderItemID   int32  `json:"order_item_id"`
	ProductID     int32  `json:"product_id"`
	ProductName   string `json:"product_name"`
	VariantID     int32  `json:"variant_id"`
	VariantName   string `json:"variant_name"`
	CustomerID    int32  `json:"customer_id"`
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`
}

type ValidateLicenseKeyResponse struct {
	Valid      bool            `json:"valid"`
	Error      *string         `json:"error"`
	LicenseKey *LicenseKey     `json:"license_key"`
	Meta       *LicenseKeyMeta `json:"meta"`
}

type ActiveLicenseKeyResponse struct {
	Activated  bool            `json:"activated"`
	Error      *string         `json:"error"`
	LicenseKey *LicenseKey     `json:"license_key"`
	Meta       *LicenseKeyMeta `json:"meta"`
}

func validateLicenseKey(licenseKey string, instanceName string) (*ValidateLicenseKeyResponse, error) {
	data := map[string]string{"license_key": licenseKey}
	if instanceName != "" {
		data["instance_name"] = instanceName
	}
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal data")
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v1/licenses/validate", baseAPIURL), bytes.NewBuffer(payload))
	if err != nil {
		return nil, errors.Wrap(err, "failed to create request")
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to do request")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var response ValidateLicenseKeyResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}
	if response.Error == nil {
		if response.Meta == nil {
			return nil, errors.New("meta is nil")
		}
		if response.Meta.StoreID != storeID || response.Meta.ProductID != subscriptionProProductID {
			return nil, errors.New("invalid store or product id")
		}
	}
	licenseCache.Set("key", "value", 24*time.Hour)
	return &response, nil
}

func activeLicenseKey(licenseKey string, instanceName string) (*ActiveLicenseKeyResponse, error) {
	data := map[string]string{"license_key": licenseKey, "instance_name": instanceName}
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal data")
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v1/licenses/activate", baseAPIURL), bytes.NewBuffer(payload))
	if err != nil {
		return nil, errors.Wrap(err, "failed to create request")
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "failed to do request")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var response ActiveLicenseKeyResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}
	if response.Error == nil {
		if response.Meta == nil {
			return nil, errors.New("meta is nil")
		}
		if response.Meta.StoreID != storeID || response.Meta.ProductID != subscriptionProProductID {
			return nil, errors.New("invalid store or product id")
		}
	}
	return &response, nil
}
