# Units API

Module quản lý đơn vị (Units) trong hệ thống TDMU Dispatch.

## Các chức năng chính

### 1. Tạo đơn vị mới
```graphql
mutation CreateUnit($createUnitInput: CreateUnitInput!) {
  createUnit(createUnitInput: $createUnitInput) {
    metadata {
      statusCode
      message
    }
    data {
      unit {
        id
        unitName
        unitTypeId
        parentUnitId
        establishmentDate
        email
        phone
      }
    }
  }
}
```

**Input:**
```json
{
  "createUnitInput": {
    "unitName": "Phòng Công nghệ thông tin",
    "unitTypeId": 1,
    "parentUnitId": null,
    "establishmentDate": "2020-01-01",
    "email": "cntt@tdmu.edu.vn",
    "phone": "0123456789"
  }
}
```

### 2. Lấy danh sách đơn vị (có phân trang)
```graphql
query GetUnits($input: GetUnitsPaginatedInput!) {
  units(input: $input) {
    metadata {
      statusCode
      message
    }
    data {
      id
      unitName
      unitType {
        id
        typeName
      }
      parentUnit {
        id
        unitName
      }
      establishmentDate
      email
      phone
      childUnits {
        id
        unitName
      }
    }
    totalCount
    hasNextPage
  }
}
```

**Input:**
```json
{
  "input": {
    "page": 1,
    "take": 10,
    "order": "ASC",
    "search": "công nghệ",
    "unitTypeId": 1,
    "parentUnitId": null
  }
}
```

### 3. Lấy thông tin đơn vị theo ID
```graphql
query GetUnit($id: Int!) {
  unit(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      unit {
        id
        unitName
        unitType {
          id
          typeName
        }
        parentUnit {
          id
          unitName
        }
        establishmentDate
        email
        phone
        childUnits {
          id
          unitName
        }
      }
    }
  }
}
```

### 4. Cập nhật đơn vị
```graphql
mutation UpdateUnit($updateUnitInput: UpdateUnitInput!) {
  updateUnit(updateUnitInput: $updateUnitInput) {
    metadata {
      statusCode
      message
    }
    data {
      unit {
        id
        unitName
        unitTypeId
        parentUnitId
        establishmentDate
        email
        phone
      }
    }
  }
}
```

**Input:**
```json
{
  "updateUnitInput": {
    "id": 1,
    "unitName": "Phòng CNTT (Cập nhật)",
    "email": "cntt.new@tdmu.edu.vn"
  }
}
```

### 5. Xóa đơn vị
```graphql
mutation RemoveUnit($id: Int!) {
  removeUnit(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      success
    }
  }
}
```

## Quyền truy cập

- **Tạo, cập nhật, xóa đơn vị**: Chỉ SUPER_ADMIN
- **Xem danh sách và thông tin đơn vị**: Public (tất cả người dùng)

## Cấu trúc dữ liệu

### Unit Entity
- `id`: ID đơn vị (auto-generated)
- `unitName`: Tên đơn vị
- `unitTypeId`: ID loại đơn vị (foreign key)
- `unitType`: Thông tin loại đơn vị (relation)
- `parentUnitId`: ID đơn vị cha (foreign key)
- `parentUnit`: Thông tin đơn vị cha (relation)
- `establishmentDate`: Ngày thành lập
- `email`: Email đơn vị
- `phone`: Số điện thoại đơn vị
- `childUnits`: Danh sách đơn vị con (relation)

## Lưu ý

1. Khi xóa đơn vị, hệ thống sẽ kiểm tra xem có đơn vị con nào không. Nếu có, sẽ không cho phép xóa.
2. Tất cả các trường ngoại trừ `unitName` và `establishmentDate` đều có thể null.
3. Tìm kiếm sẽ tìm trong `unitName`, `email`, và `phone`.
4. Có thể lọc theo `unitTypeId` và `parentUnitId`. 