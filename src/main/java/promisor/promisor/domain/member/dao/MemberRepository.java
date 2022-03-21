package promisor.promisor.domain.member.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import promisor.promisor.domain.member.domain.Member;

@Transactional(readOnly = true)
public interface MemberRepository extends JpaRepository<Member, Long> {

    Member findByEmail(String email);

    @Transactional
    @Modifying
    @Query("update Member m " +
            "set m.status = 'ACTIVE' where m.email = ?1")
    int enableMember(String email);

    boolean existsByEmail(String email);
}
