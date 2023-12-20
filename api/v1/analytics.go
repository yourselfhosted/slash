package v1

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mssola/useragent"
	"golang.org/x/exp/slices"

	"github.com/yourselfhosted/slash/internal/util"
	"github.com/yourselfhosted/slash/server/metric"
	"github.com/yourselfhosted/slash/store"
)

type ReferenceInfo struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type DeviceInfo struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type BrowserInfo struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type AnalysisData struct {
	ReferenceData []ReferenceInfo `json:"referenceData"`
	DeviceData    []DeviceInfo    `json:"deviceData"`
	BrowserData   []BrowserInfo   `json:"browserData"`
}

func (s *APIV1Service) registerAnalyticsRoutes(g *echo.Group) {
	g.GET("/shortcut/:shortcutId/analytics", func(c echo.Context) error {
		ctx := c.Request().Context()
		shortcutID, err := util.ConvertStringToInt32(c.Param("shortcutId"))
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("shortcut id is not a number: %s", c.Param("shortcutId"))).SetInternal(err)
		}
		activities, err := s.Store.ListActivities(ctx, &store.FindActivity{
			Type:              store.ActivityShortcutView,
			PayloadShortcutID: &shortcutID,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to get activities, err: %s", err)).SetInternal(err)
		}

		referenceMap := make(map[string]int)
		deviceMap := make(map[string]int)
		browserMap := make(map[string]int)
		for _, activity := range activities {
			payload := &ActivityShorcutViewPayload{}
			if err := json.Unmarshal([]byte(activity.Payload), payload); err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to unmarshal payload, err: %s", err)).SetInternal(err)
			}

			if _, ok := referenceMap[payload.Referer]; !ok {
				referenceMap[payload.Referer] = 0
			}
			referenceMap[payload.Referer]++

			ua := useragent.New(payload.UserAgent)
			deviceName := ua.OSInfo().Name
			browserName, _ := ua.Browser()

			if _, ok := deviceMap[deviceName]; !ok {
				deviceMap[deviceName] = 0
			}
			deviceMap[deviceName]++

			if _, ok := browserMap[browserName]; !ok {
				browserMap[browserName] = 0
			}
			browserMap[browserName]++
		}

		metric.Enqueue("shortcut analytics")
		return c.JSON(http.StatusOK, &AnalysisData{
			ReferenceData: mapToReferenceInfoSlice(referenceMap),
			DeviceData:    mapToDeviceInfoSlice(deviceMap),
			BrowserData:   mapToBrowserInfoSlice(browserMap),
		})
	})
}

func mapToReferenceInfoSlice(m map[string]int) []ReferenceInfo {
	referenceInfoSlice := make([]ReferenceInfo, 0)
	for key, value := range m {
		referenceInfoSlice = append(referenceInfoSlice, ReferenceInfo{
			Name:  key,
			Count: value,
		})
	}
	slices.SortFunc(referenceInfoSlice, func(i, j ReferenceInfo) int {
		return i.Count - j.Count
	})
	return referenceInfoSlice
}

func mapToDeviceInfoSlice(m map[string]int) []DeviceInfo {
	deviceInfoSlice := make([]DeviceInfo, 0)
	for key, value := range m {
		deviceInfoSlice = append(deviceInfoSlice, DeviceInfo{
			Name:  key,
			Count: value,
		})
	}
	slices.SortFunc(deviceInfoSlice, func(i, j DeviceInfo) int {
		return i.Count - j.Count
	})
	return deviceInfoSlice
}

func mapToBrowserInfoSlice(m map[string]int) []BrowserInfo {
	browserInfoSlice := make([]BrowserInfo, 0)
	for key, value := range m {
		browserInfoSlice = append(browserInfoSlice, BrowserInfo{
			Name:  key,
			Count: value,
		})
	}
	slices.SortFunc(browserInfoSlice, func(i, j BrowserInfo) int {
		return i.Count - j.Count
	})
	return browserInfoSlice
}
