package gumroad

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/pkg/errors"
)

const (
	// The base API URL for the Gumroad API.
	baseAPIURL = "https://api.gumroad.com"
	// The product ID from Gumroad (base64 encoded).
	productID = "mjSmJtQJcYNtu4vdxeQWNg=="
)

type Purchase struct {
	SellerID                string  `json:"seller_id"`
	ProductID               string  `json:"product_id"`
	ProductName             string  `json:"product_name"`
	Permalink               string  `json:"permalink"`
	ProductPermalink        string  `json:"product_permalink"`
	Email                   string  `json:"email"`
	Price                   int     `json:"price"`
	GumroadFee              int     `json:"gumroad_fee"`
	Currency                string  `json:"currency"`
	Quantity                int     `json:"quantity"`
	SaleID                  string  `json:"sale_id"`
	SaleTimestamp           string  `json:"sale_timestamp"`
	PurchaserID             string  `json:"purchaser_id,omitempty"`
	SubscriptionID          string  `json:"subscription_id,omitempty"`
	LicenseKey              string  `json:"license_key"`
	IsMultiseatLicense      bool    `json:"is_multiseat_license"`
	IPCountry               string  `json:"ip_country"`
	Recurrence              string  `json:"recurrence,omitempty"`
	Refunded                bool    `json:"refunded"`
	Disputed                bool    `json:"disputed"`
	DisputeWon              bool    `json:"dispute_won"`
	Chargebacked            bool    `json:"chargebacked"`
	ID                      string  `json:"id"`
	CreatedAt               string  `json:"created_at"`
	SubscriptionEndedAt     *string `json:"subscription_ended_at"`
	SubscriptionCancelledAt *string `json:"subscription_cancelled_at"`
	SubscriptionFailedAt    *string `json:"subscription_failed_at"`
}

type ValidateLicenseKeyResponse struct {
	Success  bool      `json:"success"`
	Uses     int       `json:"uses"`
	Purchase *Purchase `json:"purchase"`
	Message  *string   `json:"message"`
}

type ActiveLicenseKeyResponse struct {
	Success  bool      `json:"success"`
	Uses     int       `json:"uses"`
	Purchase *Purchase `json:"purchase"`
	Message  *string   `json:"message"`
}

func ValidateLicenseKey(licenseKey string, instanceName string) (*ValidateLicenseKeyResponse, error) {
	data := map[string]string{
		"product_id":  productID,
		"license_key": licenseKey,
	}
	if instanceName != "" {
		data["increment_uses_count"] = "false"
	}
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal data")
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v2/licenses/verify", baseAPIURL), bytes.NewBuffer(payload))
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

	// Check for errors
	if response.Message != nil && *response.Message != "" {
		return nil, errors.New(*response.Message)
	}

	// Validate the response
	if response.Success && response.Purchase != nil {
		purchase := response.Purchase

		// Check if purchase was refunded/chargebacked
		if purchase.Refunded {
			return nil, errors.New("license key has been refunded")
		}
		if purchase.Chargebacked {
			return nil, errors.New("license key has been chargebacked")
		}
		if purchase.Disputed && !purchase.DisputeWon {
			return nil, errors.New("license key is disputed")
		}

		// Check subscription status (for membership products)
		if purchase.SubscriptionEndedAt != nil && *purchase.SubscriptionEndedAt != "" {
			return nil, errors.New("subscription has ended")
		}
		if purchase.SubscriptionCancelledAt != nil && *purchase.SubscriptionCancelledAt != "" {
			return nil, errors.New("subscription has been cancelled")
		}
		if purchase.SubscriptionFailedAt != nil && *purchase.SubscriptionFailedAt != "" {
			return nil, errors.New("subscription payment failed")
		}
	}

	return &response, nil
}

func ActiveLicenseKey(licenseKey string, _ string) (*ActiveLicenseKeyResponse, error) {
	data := map[string]string{
		"product_id":           productID,
		"license_key":          licenseKey,
		"increment_uses_count": "true",
	}
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal data")
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/v2/licenses/verify", baseAPIURL), bytes.NewBuffer(payload))
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

	// Check for errors
	if response.Message != nil && *response.Message != "" {
		return nil, errors.New(*response.Message)
	}

	// Validate the response
	if response.Success && response.Purchase != nil {
		purchase := response.Purchase

		// Check if purchase was refunded/chargebacked
		if purchase.Refunded {
			return nil, errors.New("license key has been refunded")
		}
		if purchase.Chargebacked {
			return nil, errors.New("license key has been chargebacked")
		}
		if purchase.Disputed && !purchase.DisputeWon {
			return nil, errors.New("license key is disputed")
		}

		// Check subscription status (for membership products)
		if purchase.SubscriptionEndedAt != nil && *purchase.SubscriptionEndedAt != "" {
			return nil, errors.New("subscription has ended")
		}
		if purchase.SubscriptionCancelledAt != nil && *purchase.SubscriptionCancelledAt != "" {
			return nil, errors.New("subscription has been cancelled")
		}
		if purchase.SubscriptionFailedAt != nil && *purchase.SubscriptionFailedAt != "" {
			return nil, errors.New("subscription payment failed")
		}
	}

	return &response, nil
}
