package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/yourselfhosted/slash/server"
	"github.com/yourselfhosted/slash/server/metric"
	"github.com/yourselfhosted/slash/server/profile"
	"github.com/yourselfhosted/slash/server/version"
	"github.com/yourselfhosted/slash/store"
	"github.com/yourselfhosted/slash/store/db"
)

const (
	greetingBanner = `Welcome to Slash!`
)

var (
	rootCmd = &cobra.Command{
		Use:   "slash",
		Short: `An open source, self-hosted links shortener and sharing platform.`,
		Run: func(_ *cobra.Command, _ []string) {
			serverProfile := &profile.Profile{
				Mode:        viper.GetString("mode"),
				Port:        viper.GetInt("port"),
				Data:        viper.GetString("data"),
				DSN:         viper.GetString("dsn"),
				Driver:      viper.GetString("driver"),
				Public:      viper.GetBool("public"),
				InstanceURL: viper.GetString("instance-url"),
				Version:     version.GetCurrentVersion(viper.GetString("mode")),
			}
			if err := serverProfile.Validate(); err != nil {
				panic(err)
			}

			ctx, cancel := context.WithCancel(context.Background())
			dbDriver, err := db.NewDBDriver(serverProfile)
			if err != nil {
				cancel()
				slog.Error("failed to create db driver", "error", err)
				return
			}
			if err := dbDriver.Migrate(ctx); err != nil {
				cancel()
				slog.Error("failed to migrate db", "error", err)
				return
			}

			storeInstance := store.New(dbDriver, serverProfile)
			if err := storeInstance.MigrateWorkspaceSettings(ctx); err != nil {
				cancel()
				slog.Error("failed to migrate workspace settings", "error", err)
				return
			}
			s, err := server.NewServer(ctx, serverProfile, storeInstance)
			if err != nil {
				cancel()
				slog.Error("failed to create server", "error", err)
				return
			}

			if serverProfile.Metric {
				// nolint
				metric.NewMetricClient(s.Secret, *serverProfile)
			}

			c := make(chan os.Signal, 1)
			// Trigger graceful shutdown on SIGINT or SIGTERM.
			// The default signal sent by the `kill` command is SIGTERM,
			// which is taken as the graceful shutdown signal for many systems, eg., Kubernetes, Gunicorn.
			signal.Notify(c, os.Interrupt, syscall.SIGTERM)
			go func() {
				sig := <-c
				slog.Info(fmt.Sprintf("%s received.\n", sig.String()))
				s.Shutdown(ctx)
				cancel()
			}()

			printGreetings(serverProfile)

			if err := s.Start(ctx); err != nil {
				if err != http.ErrServerClosed {
					slog.Error("failed to start server", "error", err)
					cancel()
				}
			}

			// Wait for CTRL-C.
			<-ctx.Done()
		},
	}
)

func init() {
	viper.SetDefault("mode", "demo")
	viper.SetDefault("driver", "sqlite")
	viper.SetDefault("port", 8082)
	viper.SetDefault("public", true)

	rootCmd.PersistentFlags().String("mode", "demo", `mode of server, can be "prod" or "dev" or "demo"`)
	rootCmd.PersistentFlags().String("addr", "", "address of server")
	rootCmd.PersistentFlags().Int("port", 8082, "port of server")
	rootCmd.PersistentFlags().String("data", "", "data directory")
	rootCmd.PersistentFlags().String("driver", "sqlite", "database driver")
	rootCmd.PersistentFlags().String("dsn", "", "database source name(aka. DSN)")
	rootCmd.PersistentFlags().Bool("public", true, "")
	rootCmd.PersistentFlags().String("instance-url", "", "URL of the instance")

	if err := viper.BindPFlag("mode", rootCmd.PersistentFlags().Lookup("mode")); err != nil {
		panic(err)
	}
	if err := viper.BindPFlag("port", rootCmd.PersistentFlags().Lookup("port")); err != nil {
		panic(err)
	}
	if err := viper.BindPFlag("data", rootCmd.PersistentFlags().Lookup("data")); err != nil {
		panic(err)
	}
	if err := viper.BindPFlag("driver", rootCmd.PersistentFlags().Lookup("driver")); err != nil {
		panic(err)
	}
	if err := viper.BindPFlag("dsn", rootCmd.PersistentFlags().Lookup("dsn")); err != nil {
		panic(err)
	}
	if err := viper.BindPFlag("public", rootCmd.PersistentFlags().Lookup("public")); err != nil {
		panic(err)
	}
	if err := viper.BindPFlag("instance-url", rootCmd.PersistentFlags().Lookup("instance-url")); err != nil {
		panic(err)
	}

	viper.SetEnvPrefix("slash")
	viper.AutomaticEnv()
	if err := viper.BindEnv("instance-url", "SLASH_INSTANCE_URL"); err != nil {
		panic(err)
	}
}

func printGreetings(serverProfile *profile.Profile) {
	println("---")
	println("Server profile")
	println("dsn:", serverProfile.DSN)
	println("port:", serverProfile.Port)
	println("mode:", serverProfile.Mode)
	println("version:", serverProfile.Version)
	println("public:", serverProfile.Public)
	println("instance-url:", serverProfile.InstanceURL)
	println("---")
	println(greetingBanner)
	fmt.Printf("Version %s has been started on port %d\n", serverProfile.Version, serverProfile.Port)
	println("---")
	println("See more in:")
	fmt.Printf("👉GitHub: %s\n", "https://github.com/yourselfhosted/slash")
	println("---")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
