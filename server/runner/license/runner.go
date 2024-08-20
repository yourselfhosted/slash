package license

import (
	"context"
	"log/slog"
	"time"

	"github.com/yourselfhosted/slash/server/service/license"
	"github.com/yourselfhosted/slash/store"
)

type Runner struct {
	Store *store.Store

	licenseService *license.LicenseService
}

func NewRunner(store *store.Store, licenseService *license.LicenseService) *Runner {
	return &Runner{
		Store:          store,
		licenseService: licenseService,
	}
}

// Schedule runner every 12 hours.
const runnerInterval = time.Hour * 12

func (r *Runner) Run(ctx context.Context) {
	ticker := time.NewTicker(runnerInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			r.RunOnce(ctx)
		case <-ctx.Done():
			return
		}
	}
}

func (r *Runner) RunOnce(ctx context.Context) {
	// Load subscription.
	if _, err := r.licenseService.LoadSubscription(ctx); err != nil {
		slog.Error("failed to load subscription", slog.Any("error", err))
	}
}
