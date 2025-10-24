class ApiResponse<T> {
  final bool isSuccess;
  final T? data;
  final String message;

  const ApiResponse._({
    required this.isSuccess,
    this.data,
    required this.message,
  });

  factory ApiResponse.success(T data) {
    return ApiResponse._(
      isSuccess: true,
      data: data,
      message: 'Success',
    );
  }

  factory ApiResponse.error(String message) {
    return ApiResponse._(
      isSuccess: false,
      message: message,
    );
  }
}