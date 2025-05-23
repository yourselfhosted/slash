// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.6
// 	protoc        (unknown)
// source: store/activity.proto

package store

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
	unsafe "unsafe"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type ActivityShorcutCreatePayload struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	ShortcutId    int32                  `protobuf:"varint,1,opt,name=shortcut_id,json=shortcutId,proto3" json:"shortcut_id,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ActivityShorcutCreatePayload) Reset() {
	*x = ActivityShorcutCreatePayload{}
	mi := &file_store_activity_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ActivityShorcutCreatePayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ActivityShorcutCreatePayload) ProtoMessage() {}

func (x *ActivityShorcutCreatePayload) ProtoReflect() protoreflect.Message {
	mi := &file_store_activity_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ActivityShorcutCreatePayload.ProtoReflect.Descriptor instead.
func (*ActivityShorcutCreatePayload) Descriptor() ([]byte, []int) {
	return file_store_activity_proto_rawDescGZIP(), []int{0}
}

func (x *ActivityShorcutCreatePayload) GetShortcutId() int32 {
	if x != nil {
		return x.ShortcutId
	}
	return 0
}

type ActivityShorcutViewPayload struct {
	state         protoimpl.MessageState                           `protogen:"open.v1"`
	ShortcutId    int32                                            `protobuf:"varint,1,opt,name=shortcut_id,json=shortcutId,proto3" json:"shortcut_id,omitempty"`
	Ip            string                                           `protobuf:"bytes,2,opt,name=ip,proto3" json:"ip,omitempty"`
	Referer       string                                           `protobuf:"bytes,3,opt,name=referer,proto3" json:"referer,omitempty"`
	UserAgent     string                                           `protobuf:"bytes,4,opt,name=user_agent,json=userAgent,proto3" json:"user_agent,omitempty"`
	Params        map[string]*ActivityShorcutViewPayload_ValueList `protobuf:"bytes,5,rep,name=params,proto3" json:"params,omitempty" protobuf_key:"bytes,1,opt,name=key" protobuf_val:"bytes,2,opt,name=value"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ActivityShorcutViewPayload) Reset() {
	*x = ActivityShorcutViewPayload{}
	mi := &file_store_activity_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ActivityShorcutViewPayload) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ActivityShorcutViewPayload) ProtoMessage() {}

func (x *ActivityShorcutViewPayload) ProtoReflect() protoreflect.Message {
	mi := &file_store_activity_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ActivityShorcutViewPayload.ProtoReflect.Descriptor instead.
func (*ActivityShorcutViewPayload) Descriptor() ([]byte, []int) {
	return file_store_activity_proto_rawDescGZIP(), []int{1}
}

func (x *ActivityShorcutViewPayload) GetShortcutId() int32 {
	if x != nil {
		return x.ShortcutId
	}
	return 0
}

func (x *ActivityShorcutViewPayload) GetIp() string {
	if x != nil {
		return x.Ip
	}
	return ""
}

func (x *ActivityShorcutViewPayload) GetReferer() string {
	if x != nil {
		return x.Referer
	}
	return ""
}

func (x *ActivityShorcutViewPayload) GetUserAgent() string {
	if x != nil {
		return x.UserAgent
	}
	return ""
}

func (x *ActivityShorcutViewPayload) GetParams() map[string]*ActivityShorcutViewPayload_ValueList {
	if x != nil {
		return x.Params
	}
	return nil
}

type ActivityShorcutViewPayload_ValueList struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Values        []string               `protobuf:"bytes,1,rep,name=values,proto3" json:"values,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *ActivityShorcutViewPayload_ValueList) Reset() {
	*x = ActivityShorcutViewPayload_ValueList{}
	mi := &file_store_activity_proto_msgTypes[3]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ActivityShorcutViewPayload_ValueList) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ActivityShorcutViewPayload_ValueList) ProtoMessage() {}

func (x *ActivityShorcutViewPayload_ValueList) ProtoReflect() protoreflect.Message {
	mi := &file_store_activity_proto_msgTypes[3]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ActivityShorcutViewPayload_ValueList.ProtoReflect.Descriptor instead.
func (*ActivityShorcutViewPayload_ValueList) Descriptor() ([]byte, []int) {
	return file_store_activity_proto_rawDescGZIP(), []int{1, 1}
}

func (x *ActivityShorcutViewPayload_ValueList) GetValues() []string {
	if x != nil {
		return x.Values
	}
	return nil
}

var File_store_activity_proto protoreflect.FileDescriptor

const file_store_activity_proto_rawDesc = "" +
	"\n" +
	"\x14store/activity.proto\x12\vslash.store\"?\n" +
	"\x1cActivityShorcutCreatePayload\x12\x1f\n" +
	"\vshortcut_id\x18\x01 \x01(\x05R\n" +
	"shortcutId\"\xe6\x02\n" +
	"\x1aActivityShorcutViewPayload\x12\x1f\n" +
	"\vshortcut_id\x18\x01 \x01(\x05R\n" +
	"shortcutId\x12\x0e\n" +
	"\x02ip\x18\x02 \x01(\tR\x02ip\x12\x18\n" +
	"\areferer\x18\x03 \x01(\tR\areferer\x12\x1d\n" +
	"\n" +
	"user_agent\x18\x04 \x01(\tR\tuserAgent\x12K\n" +
	"\x06params\x18\x05 \x03(\v23.slash.store.ActivityShorcutViewPayload.ParamsEntryR\x06params\x1al\n" +
	"\vParamsEntry\x12\x10\n" +
	"\x03key\x18\x01 \x01(\tR\x03key\x12G\n" +
	"\x05value\x18\x02 \x01(\v21.slash.store.ActivityShorcutViewPayload.ValueListR\x05value:\x028\x01\x1a#\n" +
	"\tValueList\x12\x16\n" +
	"\x06values\x18\x01 \x03(\tR\x06valuesB\x9e\x01\n" +
	"\x0fcom.slash.storeB\rActivityProtoP\x01Z/github.com/yourselfhosted/slash/proto/gen/store\xa2\x02\x03SSX\xaa\x02\vSlash.Store\xca\x02\vSlash\\Store\xe2\x02\x17Slash\\Store\\GPBMetadata\xea\x02\fSlash::Storeb\x06proto3"

var (
	file_store_activity_proto_rawDescOnce sync.Once
	file_store_activity_proto_rawDescData []byte
)

func file_store_activity_proto_rawDescGZIP() []byte {
	file_store_activity_proto_rawDescOnce.Do(func() {
		file_store_activity_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_store_activity_proto_rawDesc), len(file_store_activity_proto_rawDesc)))
	})
	return file_store_activity_proto_rawDescData
}

var file_store_activity_proto_msgTypes = make([]protoimpl.MessageInfo, 4)
var file_store_activity_proto_goTypes = []any{
	(*ActivityShorcutCreatePayload)(nil), // 0: slash.store.ActivityShorcutCreatePayload
	(*ActivityShorcutViewPayload)(nil),   // 1: slash.store.ActivityShorcutViewPayload
	nil,                                  // 2: slash.store.ActivityShorcutViewPayload.ParamsEntry
	(*ActivityShorcutViewPayload_ValueList)(nil), // 3: slash.store.ActivityShorcutViewPayload.ValueList
}
var file_store_activity_proto_depIdxs = []int32{
	2, // 0: slash.store.ActivityShorcutViewPayload.params:type_name -> slash.store.ActivityShorcutViewPayload.ParamsEntry
	3, // 1: slash.store.ActivityShorcutViewPayload.ParamsEntry.value:type_name -> slash.store.ActivityShorcutViewPayload.ValueList
	2, // [2:2] is the sub-list for method output_type
	2, // [2:2] is the sub-list for method input_type
	2, // [2:2] is the sub-list for extension type_name
	2, // [2:2] is the sub-list for extension extendee
	0, // [0:2] is the sub-list for field type_name
}

func init() { file_store_activity_proto_init() }
func file_store_activity_proto_init() {
	if File_store_activity_proto != nil {
		return
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_store_activity_proto_rawDesc), len(file_store_activity_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   4,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_store_activity_proto_goTypes,
		DependencyIndexes: file_store_activity_proto_depIdxs,
		MessageInfos:      file_store_activity_proto_msgTypes,
	}.Build()
	File_store_activity_proto = out.File
	file_store_activity_proto_goTypes = nil
	file_store_activity_proto_depIdxs = nil
}
