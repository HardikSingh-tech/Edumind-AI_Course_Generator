package com.edumind.backend.repository;

import com.edumind.backend.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c WHERE " +
            "(CAST(:query AS string) IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))) AND "
            +
            "(CAST(:audience AS string) IS NULL OR LOWER(c.targetAudience) = LOWER(CAST(:audience AS string)))")
    Page<Course> searchCourses(@Param("query") String query, @Param("audience") String audience, Pageable pageable);
}
