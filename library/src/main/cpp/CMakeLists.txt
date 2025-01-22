# the minimum version of CMake.
cmake_minimum_required(VERSION 3.5.0)
project(log4a)
set(CMAKE_CXX_STANDARD 14)

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})

if(DEFINED PACKAGE_FIND_FILE)
    include(${PACKAGE_FIND_FILE})
endif()

include_directories(${NATIVERENDER_ROOT_PATH}
                    ${NATIVERENDER_ROOT_PATH}/include)

add_library(liblog4a SHARED napi_init.cpp)
target_link_libraries(liblog4a PUBLIC libace_napi.z.so)