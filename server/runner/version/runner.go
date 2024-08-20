// Package version provides a runner to check the latest version of the application.
package version

import (
	"context"
	"time"

	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/store"
)

type Runner struct {
	Store   *store.Store
	Profile *profile.Profile
}

func NewRunner(store *store.Store, profile *profile.Profile) *Runner {
	return &Runner{
		Store:   store,
		Profile: profile,
	}
}

// Schedule checker every 8 hours.
const runnerInterval = time.Hour * 8

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

func (*Runner) RunOnce(_ context.Context) {
	// Implement me.
}
