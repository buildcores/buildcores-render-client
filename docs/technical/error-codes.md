---
title: 7. Error Codes
description: HTTP status codes returned by the BuildCores Render API.
sidebar_position: 6
---

# 7. Error Codes

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Malformed request body, missing required fields, invalid categories, invalid dimensions, unsupported environment, or conflicting options such as both `winterMode` and `springMode`. |
| `401 Unauthorized` | Missing, invalid, expired, or environment/origin-mismatched token. |
| `403 Forbidden` | Session token does not have the required scope. |
| `404 Not Found` | Part ID, build share code, render job, customer-owned job, or pregenerated render not found. |
| `500 Internal Server Error` | Server-side error. |
