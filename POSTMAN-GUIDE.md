# 📮 Guía de Postman - Fiscalía Proxy API

## Tu Token de API:
```
3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d
```

---

## 🧪 Tests en Postman

### Test 1: Health Check (Público - Sin Token)

**Método:** `GET`

**URL:**
```
https://TU-URL.easypanel.app/health
```

**Headers:** (ninguno necesario)

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T22:00:00.000Z"
}
```

**Status Code:** `200 OK`

---

### Test 2: API JSON Endpoint CON Token (Debe funcionar)

**Método:** `GET`

**URL:**
```
https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457
```

**Headers:**
| Key | Value |
|-----|-------|
| `X-API-Token` | `3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d` |

**Params:**
| Key | Value |
|-----|-------|
| `cedula` | `1717199457` |

**Respuesta esperada:**
```json
{
  "success": true,
  "status_code": 200,
  "cedula": "1717199457",
  "total_casos": 4,
  "casos": [
    {
      "numero_noticia": "090101817125911",
      "lugar": "GUAYAS - GUAYAQUIL",
      "fecha": "2017-12-29",
      "hora": "09:58:57",
      "digitador": "ALFONSO DE LA CRUZ MIRIAM VIRGINIA",
      "estado": "",
      "numero_oficio": "SN-DENUNCIA FORMAL - ORAL",
      "delito": "ESTAFA(3275)",
      "unidad": "FISCALIA DE PATRIMONIO CIUDADANO - EDIFICIO MONTECRISTI - GYE",
      "sujetos": [
        {
          "cedula": "0910992569",
          "nombres": "GOMEZ GALARZA JEFFERSON ALBERTO",
          "estado": "DENUNCIANTE"
        },
        {
          "cedula": "1717199457",
          "nombres": "GUERRERO QUINTANA MARCO ANDRES",
          "estado": "TESTIGO"
        }
      ]
    }
  ]
}
```

**Status Code:** `200 OK`

---

### Test 3: API SIN Token (Debe fallar - 401)

**Método:** `GET`

**URL:**
```
https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457
```

**Headers:** (NO enviar el token)

**Params:**
| Key | Value |
|-----|-------|
| `cedula` | `1717199457` |

**Respuesta esperada:**
```json
{
  "success": false,
  "status_code": 401,
  "error": "Token de autenticación requerido. Proporciona el token en el header \"X-API-Token\" o como query parameter \"token\""
}
```

**Status Code:** `401 Unauthorized`

---

### Test 4: API con Token INVÁLIDO (Debe fallar - 403)

**Método:** `GET`

**URL:**
```
https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457
```

**Headers:**
| Key | Value |
|-----|-------|
| `X-API-Token` | `token-invalido-123` |

**Params:**
| Key | Value |
|-----|-------|
| `cedula` | `1717199457` |

**Respuesta esperada:**
```json
{
  "success": false,
  "status_code": 403,
  "error": "Token de autenticación inválido"
}
```

**Status Code:** `403 Forbidden`

---

### Test 5: API HTML Endpoint (Retorna HTML crudo)

**Método:** `GET`

**URL:**
```
https://TU-URL.easypanel.app/api/fiscalia?cedula=1717199457
```

**Headers:**
| Key | Value |
|-----|-------|
| `X-API-Token` | `3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d` |

**Params:**
| Key | Value |
|-----|-------|
| `cedula` | `1717199457` |

**Respuesta esperada:**
```json
{
  "success": true,
  "status_code": 200,
  "html": "<br><br><div class=\"general\">...</div>",
  "error": null
}
```

**Status Code:** `200 OK`

---

### Test 6: Token en Query Parameter (Alternativa)

**Método:** `GET`

**URL:**
```
https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457&token=3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d
```

**Headers:** (ninguno necesario, el token va en la URL)

**Respuesta esperada:**
```json
{
  "success": true,
  "status_code": 200,
  "cedula": "1717199457",
  "total_casos": 4,
  "casos": [...]
}
```

**Status Code:** `200 OK`

---

## 📸 Configuración Visual en Postman

### Para Test 2 (Recomendado):

1. **Crear Nueva Request:**
   - Click en "New" → "HTTP Request"
   - Nombre: "Fiscalia - JSON con Token"

2. **Configurar Request:**
   ```
   Método: GET
   URL: https://TU-URL.easypanel.app/api/fiscalia/json
   ```

3. **Pestaña "Params":**
   ```
   KEY        VALUE
   cedula     1717199457
   ```

4. **Pestaña "Headers":**
   ```
   KEY            VALUE
   X-API-Token    3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d
   ```

5. **Click en "Send"**

---

## 🔄 Probar con diferentes cédulas:

Cambia el parámetro `cedula` para probar con diferentes números:

| Cédula | Descripción |
|--------|-------------|
| `1717199457` | Caso de ejemplo (4 casos) |
| `0123456789` | Otra cédula para probar |
| `1234567890` | Prueba sin resultados |

---

## 💾 Crear Colección en Postman (Opcional)

1. Click en "Collections" → "Create Collection"
2. Nombre: "Fiscalía Proxy API"
3. Agregar todas las requests de arriba
4. Guardar

### Variables de Colección:

En la colección, configura variables:

| Variable | Valor |
|----------|-------|
| `base_url` | `https://TU-URL.easypanel.app` |
| `api_token` | `3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d` |

Luego usa en las requests:
```
URL: {{base_url}}/api/fiscalia/json
Header: X-API-Token: {{api_token}}
```

---

## ⚡ Tests Automatizados (Opcional)

En la pestaña "Tests" de Postman, agrega:

```javascript
// Test para verificar status 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test para verificar que success es true
pm.test("Response is successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

// Test para verificar que hay casos
pm.test("Has casos in response", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.total_casos).to.be.above(0);
});
```

---

## 🆘 Troubleshooting

### Error: "Could not get response"
- Verifica que la URL de Easypanel sea correcta
- Verifica que el servicio esté corriendo (status "Running")

### Error: 401 Unauthorized
- Verifica que el header `X-API-Token` esté configurado
- Verifica que el token sea exactamente: `3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d`

### Error: 403 Forbidden
- El token es incorrecto
- Verifica que copiaste el token completo sin espacios

### Error: 400 Bad Request
- Falta el parámetro `cedula`
- Verifica en la pestaña "Params" que `cedula` esté configurado

---

## ✅ Checklist de Tests

- [ ] Test 1: Health check funciona
- [ ] Test 2: API JSON con token retorna datos
- [ ] Test 3: API sin token retorna 401
- [ ] Test 4: API con token inválido retorna 403
- [ ] Test 5: API HTML funciona
- [ ] Test 6: Token en query parameter funciona

Si todos pasan, ¡tu API está funcionando perfectamente! 🎉
