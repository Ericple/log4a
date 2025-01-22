//
// Created on 2024/7/27.
//
// Node APIs are not fully supported. To solve the compilation error of the interface cannot be found,
// please include "napi/native_api.h".

#ifndef ONEFRAMEWORK_ONE_NAPI_HEADER_H
#define ONEFRAMEWORK_ONE_NAPI_HEADER_H
#include "napi/native_api.h"
#define LOG_DOMAIN 0xFF
#define LOG_TAG "OneFrameWork"
#include "hilog/log.h"
#define LOG_D(...) OH_LOG_DEBUG(LOG_APP, __VA_ARGS__)
#define LOG_I(...) OH_LOG_INFO(LOG_APP, __VA_ARGS__)
#define LOG_W(...) OH_LOG_WARN(LOG_APP, __VA_ARGS__)
#define LOG_E(...) OH_LOG_ERROR(LOG_APP, __VA_ARGS__)
#define LOG_F(...) OH_LOG_FATAL(LOG_APP, __VA_ARGS__)
#define _J_API(func_name, return_type) static return_type func_name(napi_env env, napi_callback_info info)
#define J_API(func_name) static napi_value func_name(napi_env env, napi_callback_info info)
#define INIT_ENV(arg_count, args, this_arg, data) size_t argc = arg_count;\
napi_value args[arg_count], this_arg;\
void* data;\
napi_get_cb_info(env, info, &argc, args, &this_arg, &data)
#define J_VAL(target) napi_value target
#define J_TYPE(variable_name, val) napi_valuetype variable_name;\
napi_typeof(env, val, &variable_name)
#define J_PROPERTY_DESC(target) napi_property_descriptor target
#define J_Object(target) napi_value target;\
napi_create_object(env, &target)
#define J_Define_Property(target, key, value) napi_set_named_property(env,target,key,value)
#define J_Define_Properties(target, desc) napi_define_properties(env, target, sizeof(desc)/sizeof(desc[0]), desc)
#define C_Double(variable_name, value) double variable_name;\
napi_get_value_double(env, value, &variable_name)
#define J_Double(variable_name,value) napi_value variable_name;\
napi_create_double(env,value,&variable_name)
#define C_Boolean(variable_name, value) bool variable_name;\
variable_name = napi_get_value_bool(env, value, &variable_name)
#define J_Boolean(variable_name, value) napi_value variable_name;\
napi_get_boolean(env, value, &variable_name)
#define C_I32(variable_name,value) int32_t variable_name;\
variable_name = napi_get_value_int32(env, value, &variable_name)
#define J_I32(variable_name, value) napi_value variable_name;\
napi_create_int32(env,value,&variable_name)
#define C_I64(variable_name, value) int64_t variable_name;\
variable_name = napi_get_value_int64(env, value, &variable_name)
#define J_I64(variable_name, value) napi_value variable_name;\
napi_create_int64(env, value, &variable_name)
#define C_U16Str(variable_name, value, size_result) size_t size_result;\
char16_t variable_name[1024];\
napi_get_value_string_utf16(env, value, variable_name, 1024, &size_result)
#define J_U16Str(variable_name, value, len) napi_value variable_name;\
napi_create_string_utf16(env, value, len, &variable_name)
#define C_U8StrL(variable_name, value, max_length, size_result)                                                        \
    size_t size_result;                                                                                                \
    char variable_name[max_length];                                                                              \
    napi_get_value_string_utf8(env, value, variable_name, max_length, &size_result);                                   
#define C_U8Str(variable_name, value, size_result) size_t size_result;\
char variable_name[1024];\
napi_get_value_string_utf8(env, value, variable_name, 1024, &size_result)
#define J_U8Str(variable_name, value) napi_value variable_name;\
napi_create_string_utf8(env, value, NAPI_AUTO_LENGTH, &variable_name)
#define C_L1Str(variable_name, value, size_result) size_t size_result;\
char* variable_name;\
napi_get_value_string_latin1(env, value, variable_name, 1024, &size_result)
#define J_L1Str(variable_name, value) napi_value variable_name;\
napi_create_string_latin1(env, value, NAPI_AUTO_LENGTH, &variable_name)
#define J_Array(variable_name) napi_value variable_name;\
napi_create_array(env, &variable_name)
#define J_ArrayEl(target, index, value) napi_set_element(env, target, index, value)
#define J_Undefined(variable_name) napi_value variable_name;\
napi_get_undefined(env, &variable_name)
#define J_Null(variable_name) napi_value variable_name;\
napi_get_null(env, &variable_name)
#define MODULE_INIT(module_name) static napi_value module_name(napi_env env, napi_value exports)

#define J_TypeError(code, message) napi_throw_type_error(env, code, message)
#define J_Error(code, message) napi_throw_error(env, code, message)
#endif //ONEFRAMEWORK_ONE_NAPI_HEADER_H
